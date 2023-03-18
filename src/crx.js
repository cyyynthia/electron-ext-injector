/*! Copyright (c) Cynthia Rey, All rights reserved. */

import { join } from 'path'
import { rm, readFile, writeFile, readdir, stat } from 'fs/promises'
import { Extract } from 'unzipper'
import { getChromeVersion  } from './electron.js'

const COMPAT = await readFile(new URL('./compat.js', import.meta.url), 'utf8')

// Most MV3 stuff in Electron doesn't work. Downgrade to MV2.
async function patchManifest (manifest, path) {
	const parsed = JSON.parse(manifest)
	if (parsed.manifest_version === 2) return manifest
	parsed.manifest_version = 2

	if ('host_permissions' in parsed) {
		parsed.permissions = parsed.permissions || []
		parsed.permissions.push(...parsed.host_permissions)
		delete parsed.host_permissions
	}

	if ('optional_host_permissions' in parsed) {
		parsed.optional_permissions = parsed.optional_permissions || []
		parsed.optional_permissions.push(...parsed.optional_host_permissions)
		delete parsed.optional_host_permissions
	}

	if ('web_accessible_resources' in parsed) {
		parsed.web_accessible_resources = parsed.web_accessible_resources.map((r) => r.resources).flat()
	}

	if ('content_security_policy' in parsed) {
		parsed.content_security_policy = parsed.content_security_policy.extension_pages
	}

	if ('background' in parsed) {
		const html = `<script src=${JSON.stringify(parsed.background.service_worker)}${parsed.background.type ? ` type="${parsed.background.type}"` : ''}></script>`
		await writeFile(join(path, 'eei_mv2_background.html'), html)
		parsed.background = {
			page: 'eei_mv2_background.html'
		}
	}

	return JSON.stringify(parsed, null, '\t')
}

async function patchExtension (ext, rec = false) {
	// This folder causes Electron to complain. Now it doesn't.
	if (!rec) await rm(join(ext, '_metadata'), { recursive: true })

	const files = await readdir(ext)
	for (const file of files) {
		const path = join(ext, file)
		const s = await stat(path)
		if (s.isDirectory()) {
			await patchExtension(path, true)
			continue
		}

		if (file === 'manifest.json' && !rec) {
			const manifest = await readFile(path, 'utf8')
			await writeFile(path, await patchManifest(manifest, ext))
		} else if (file.endsWith('.js')) {
			const js = await readFile(path, 'utf8')
			await writeFile(path, COMPAT + js)
		} else if (file.endsWith('.html')) {
			const html = await readFile(path, 'utf8')
			const head = html.indexOf('<head>')
			if (head === -1) {
				await writeFile(path, `<script>\n${COMPAT}</script>${html}`)
				continue
			}

			await writeFile(path, `${html.slice(0, head + 6)}\n<script>\n${COMPAT}</script>\n${html.slice(head + 6)}`)
		}
	}
}

export async function downloadExt (executable, folder, crx) {
	const dst = join(folder, crx)
	const chromeVer = await getChromeVersion(executable)

	const crxUrl = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=${chromeVer}&acceptformat=crx2,crx3&x=id%3D${crx}%26uc`
	const res = await fetch(crxUrl)
	const archive = Buffer.from(await res.arrayBuffer())

	let zip
	switch (archive.readUInt32LE(4)) {
		case 2:
			zip = archive.slice(16 + archive.readUInt32LE(8) + archive.readUInt32LE(12))
			break
		case 3:
			zip = archive.slice(12 + archive.readUInt32LE(8))
			break
	}

	return new Promise((resolve) => {
		const stream = Extract({ path: dst })
		stream.on('close', () => patchExtension(dst).then(() => resolve()))
		stream.end(zip)
	})
}
