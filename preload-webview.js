const { ipcRenderer, remote, webFrame } = require('electron')
const { notify, openFolderDialog } = require('./utils/renderer/electron')

const PluginHost = remote.getGlobal('PluginHost')

const clientInterface = client => {
  return {
    name: client.name,
    displayName: client.displayName,
    api: client.plugin.api,
    sendRpc: async (method, params) => {
      return client.rpc(method, params)
    },
    stdinWrite: payload => {
      return client.plugin.write(payload)
    },
    getState: () => {
      return client.state
    },
    execute: command => {
      client.execute(command)
    },
    on: (eventName, handler) => {
      return client.on(eventName, handler)
    },
    off: (eventName, handler) => {
      return client.removeListener(eventName, handler)
    }
  }
}

window.grid = {
  version: '0.1.0',
  getAllPlugins: () => {
    return PluginHost.getAllPlugins().map(client => clientInterface(client))
  },
  getClient: name => {
    let client = PluginHost.getAllPlugins().find(p => p.name === name)
    return client ? clientInterface(client) : client
  },
  notify,
  openFolderDialog
}
