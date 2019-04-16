const fs = require('fs')
const path = require('path')
const { Plugin, PluginProxy } = require('./Plugin')

// TODO add file to electron packaged files
class PluginHost {
  constructor() {
    this.plugins = []
    this.discover()
  }
  // TODO should be async and not block UI init
  discover() {
    const PLUGIN_DIR = path.join(__dirname, 'client_plugins')
    const pluginFiles = fs.readdirSync(PLUGIN_DIR)

    console.time('plugin init')
    const plugins = []
    pluginFiles.forEach(f => {
      try {
        const fullPath = path.join(PLUGIN_DIR, f)
        if (
          fullPath.includes('geth') /*|| fullPath.includes('aleth') */ ||
          fullPath.includes('parity')
        ) {
          const pluginConfig = require(fullPath)
          // 2. TODO validate / verify
          const plugin = new Plugin(pluginConfig)
          plugins.push(plugin)
        }
      } catch (error) {
        console.log(`plugin ${f} could not be loaded`, error)
      }
    })
    console.timeEnd('plugin init')

    this.plugins = [...plugins]
  }
  getAllMetadata() {
    return this.plugins.map(p => p.config)
  }
  // called from renderer
  getAllPlugins() {
    return this.plugins.map(p => new PluginProxy(p))
  }
  start(name) {
    console.log('start plugin', name)
  }
  stop(name) {
    console.log('stop plugin', name)
  }
}

global.PluginHost = new PluginHost()
