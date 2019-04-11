const fs = require('fs')
const path = require('path')
const { EventEmitter } = require('events')
const { getBinaryUpdater } = require('./util')

class Plugin {
  constructor(config) {
    const { name, repository } = config
    this.updater = getBinaryUpdater(repository, name)
    this.config = config
  }
  get name(){
    return this.config.name
  }
  get displayName(){
    return this.config.displayName
  }
  async getReleases(){
    const releases = await this.updater.getReleases()
    return releases
  }
  download(release, onProgress){
    return this.updater.download(release, { onProgress })
  }
}

class PluginProxy extends EventEmitter {
  constructor(plugin){
    super()
    this.plugin = plugin
    this.logs = []
    console.log('start logs for', this.plugin.name)
    setInterval(() => {
      let log = `${this.plugin.name} bla foo baz bar`
      this.logs.push(log)
      this.emit('log', log)
    }, 500)
    this._isRunning = false
  }
  get name(){
    return this.plugin.name
  }
  get displayName(){
    return this.plugin.displayName
  }
  get state(){
    return this._isRunning ? 'running' : 'stopped'
  }
  get error(){
    return ''
  }
  getLogs() {
    return this.logs
  }
  getReleases() {
    return this.plugin.getReleases()
  }
  download(release, onProgress) {
    return this.plugin.download(release, progress => {
      onProgress(progress)
    })
    /*
    return new Promise((resolve, reject) => {
      console.log('download download', release)
      let p = 0
      let handler = setInterval(() => {
        onProgress(p+=5)
        if(p >= 100) {
          clearInterval(handler)
          resolve()
        }
      }, 100)
    });
    */
  }
  isRunning(){
    return this._isRunning
  }
  start(){
    this._isRunning = true
    console.log(`client ${this.plugin.name} started`)  
  }
  stop(){
    this._isRunning = false
    console.log(`client ${this.plugin.name} stopped`)
  }
}

class PluginHost {
  constructor(){
    this.plugins = []
    this.discover()
  }
  // TODO should be async and not block UI init
  discover() {
    const PLUGIN_DIR = path.join(__dirname, 'client_plugins')
    const pluginFiles = fs.readdirSync(PLUGIN_DIR)

    console.time('plugin init')
    const plugins = [ ]
    pluginFiles.forEach(f => {
      try {
        const fullPath = path.join(PLUGIN_DIR, f)
        if (fullPath.includes('geth') || fullPath.includes('aleth') || fullPath.includes('parity')) {
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

global.PluginHost = new PluginHost