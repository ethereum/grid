const { ipcRenderer, remote, webFrame } = require('electron')
const PluginHost = remote.getGlobal('PluginHost')

const notify = (title, body) => {
  const notification = new Notification(title, { body })
  notification.onclick = () => {
    const window = remote.getCurrentWindow()
    if (window) {
      window.show()
    }
  }
}

window.grid = {
  version: '0.1.0',
  notify,
  getClient: name => {
    const client = PluginHost.getAllPlugins().find(p => p.name === name)
    return client
  }
}
