/** Copyright (c) 2022 Cynthia K. Rey, All rights reserved. */

const fs = require('fs')
const path = require('path')
const electron = require('electron')
const extensionsHtml = path.join(__dirname, 'extensions.html')

electron.app.on('ready', async () => {
  const extPath = path.join(require.main.path, '..', '..', 'eei-exts')
  for (const ext of fs.readdirSync(extPath)) {
    await electron.session.defaultSession.loadExtension(path.join(extPath, ext))
  }
})

let optWin
let view

function onResize (e) {
  if (!view) return
  const { width: w } = e.sender.getBounds()
  const { width, height, y } = view.getBounds()
  const x = w - width - 24

  view.setBounds({ x, y, width, height })
}

electron.app.on('web-contents-created', (_, wc) => {
  wc.on('before-input-event', async (event, input) => {
    if (input.alt && input.shift && input.code === 'KeyE' && !input.ctrl && !input.meta) {
      event.preventDefault()
      if (view) return

      view = new electron.BrowserView()
      const win = electron.BrowserWindow.getFocusedWindow()
      const clickPromise = win.webContents.executeJavaScript('new Promise((r) => document.body.addEventListener("click", (e) => e.preventDefault()|r(), { capture: true, once: true }))')
      const styleId = await win.webContents.insertCSS('body * { pointer-events: none }')

      const extensions = electron.session.defaultSession.getAllExtensions().map((e) => ({
        id: e.id,
        name: e.name,
        baseUrl: e.url,
        popup: e.manifest.browser_action?.default_popup || e.manifest.action?.default_popup || null,
        options: e.manifest.options_ui?.page || e.manifest.options_page || null,
      }))

      clickPromise.then(() => {
        win.off('resize', onResize)
        win.removeBrowserView(view)
        win.webContents.removeInsertedCSS(styleId)
        view = null
      })

      win.on('resize', onResize)
      view.setBounds({ x: 0, y: 24, width: 360, height: 480 })
      view.webContents.loadURL(`file://${extensionsHtml}`)
      win.addBrowserView(view)
      onResize({ sender: win })

      const action = await view.webContents.executeJavaScript(`window._run(${JSON.stringify(extensions)})`)
      if (action.action === 'options') {
        win.webContents.executeJavaScript('document.body.click()')
        optWin = new electron.BrowserWindow()
        optWin.loadURL(action.dst)
      } else {
        view.webContents.loadURL(action.dst)
      }
    }
  })
})
