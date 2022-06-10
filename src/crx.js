/** Copyright (c) 2022 Cynthia K. Rey, All rights reserved. */

import { join } from 'path'
import { rm } from 'fs/promises'
import { fetch } from 'undici'
import { Extract } from 'unzipper'
import { getChromeVersion  } from './electron.js'

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
    stream.on('close', () => rm(join(dst, '_metadata'), { recursive: true }).then(() => resolve()))
    stream.end(zip)
  })
}
