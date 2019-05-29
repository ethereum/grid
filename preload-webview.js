const { ipcRenderer, remote, webFrame } = require('electron')
const PluginHost = remote.getGlobal('PluginHost')

window.grid = {
  version: '0.1.0',
  getClient: name => {
    const client = PluginHost.getAllPlugins().find(p => p.name === name)
    return client
  }
}
