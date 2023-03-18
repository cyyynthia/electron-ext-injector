/*! Copyright (c) Cynthia Rey, All rights reserved. */

import { join } from 'path'
import { existsSync } from 'fs'
import { mkdir, symlink } from 'fs/promises'
import { randomUUID } from 'crypto'
import { downloadExt } from './crx.js'
import { injectScript } from './electron.js'

const runtime = new URL('./eei-loader.cjs', import.meta.url)

const executable = process.argv[2]
const ext = process.argv[3]

const extFolder = join(executable, '..', 'eei-exts')
const runtimeFile = join(executable, '..', 'eei-loader.js')

// prepare runtime if not exists
if (!existsSync(extFolder)) await mkdir(extFolder)
if (!existsSync(runtimeFile)) {
	await symlink(runtime, runtimeFile)
	await injectScript(executable, runtimeFile)
}

// link extension
if (existsSync(ext)) {
	const id = randomUUID()
	await symlink(ext, join(extFolder, id))
	console.log('done')
	process.exit(0)
}

await downloadExt(executable, extFolder, ext)
console.log('done')
process.exit(0)
