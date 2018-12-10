const { ipcRenderer, remote, webFrame } = require('electron')

const thisWin = remote.getCurrentWindow()

// see contextIsolation for more info:
// pass the initial data to the isolated window context and de-serialize it:
webFrame.executeJavaScript(`
  window.data = ${thisWin.data}
  try {
    // window.data = JSON.parse(window.data)
  } catch (error) {
    console.error(error)
  }
`)

ipcRenderer.on('__update', (event, data) => {
  let dataString = JSON.stringify(data)
  webFrame.executeJavaScript(`
    try {
      window.dispatchEvent(new CustomEvent('update', {detail: ${dataString} }));
    } catch (error) {
      console.error(error)
    }
  `)
})

