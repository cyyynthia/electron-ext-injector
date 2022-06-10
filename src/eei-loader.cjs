/** Copyright (c) 2022 Cynthia K. Rey, All rights reserved. */

const fs = require('fs')
const path = require('path')
const electron = require('electron')

electron.app.on('ready', async () => {
  const extPath = path.join(require.main.path, '..', '..', 'eei-exts')
  console.log(await Promise.all(
    fs.readdirSync(extPath).map(
      (ext) => electron.session.defaultSession.loadExtension(path.join(extPath, ext))
    )
  ))
})
