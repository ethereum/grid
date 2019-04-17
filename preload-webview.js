const { ipcRenderer, remote, webFrame } = require('electron')
const PluginHost = remote.getGlobal('PluginHost')

window.grid = {
  version: '0.1.0',
  getClient: name => {
    let client = PluginHost.getAllPlugins().find(p => p.name === name)
    return {
      sendRpc: async (method, params) => {
        return client.rpc(method, params)
      }
    }
  }
}
