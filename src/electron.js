/*! Copyright (c) Cynthia Rey, All rights reserved. */

import { join } from 'path'
import { createReadStream, existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'

const PREFIX = Buffer.from('Chrome/', 'utf8')

export async function getChromeVersion (executable) {
	return new Promise((resolve) => {
		const stream = createReadStream(executable)
		let prefixPos = 0
		let readingVer = false
		let version = []
		stream.on('data', (chunk) => {
			for (const byte of chunk) {
				if (readingVer) {
					if ((byte < 0x30 || byte > 0x39) && byte != 0x2e) {
						if (version.length) {
							resolve(Buffer.from(version).toString('utf8'))
							stream.read()
							stream.close()
						}

						readingVer = false
						continue
					}

					version.push(byte)
					continue
				}

				if (PREFIX[prefixPos] === byte) {
					prefixPos++
					if (prefixPos === PREFIX.length) {
						readingVer = true
						prefixPos = 0
					}
				} else {
					prefixPos = 0
				}
			}
		})
	})
}

const asarScript = (file) => `
require(${JSON.stringify(file)})
const _module = require('module')
const _electron = require('electron')
const _path = require('path')

// incognito
const asar = _path.join(require.main.filename, '..', '..', 'app.asar')
const pkg = require(_path.join(asar, 'package.json'))
require.main.filename = _path.join(asar, pkg.main)
_electron.app.setAppPath(asar)
_electron.app.name = pkg.name

_module._load(require.main.filename, null, true)
`

async function injectScriptAsar (resources, file) {
	await mkdir(join(resources, 'app'))
	await writeFile(join(resources, 'app', 'index.js'), asarScript(file))
	await writeFile(join(resources, 'app', 'package.json'), '{"main":"index.js","name":"eei"}')
}

async function injectScriptFolder (resources, file) {
	const pkgFile = join(resources, 'app', 'package.json')
	const pkg = JSON.parse(await readFile(pkgFile, 'utf8'))
	const main = pkg.main.endsWith('.js') ? pkg.main : `${pkg.main}.js`

	const mainScript = await readFile(main, 'utf8')
	const prelude = `require(${JSON.stringify(file)});\n`
	await writeFile(main, prelude + mainScript)
}

export async function injectScript (executable, file) {
	const resources = join(executable, '..', 'resources')
	const asar = join(resources, 'app.asar')
	if (existsSync(asar)) return injectScriptAsar(resources, file)
	return injectScriptFolder(resources, file)
}
