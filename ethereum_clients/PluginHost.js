const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { EventEmitter } = require('events')
const { getBinaryUpdater } = require('./util')
const ControlledProcess = require('./ControlledProcess')

class Plugin {
  constructor(config) {
    const { name, repository, filter, prefix } = config
    this.updater = getBinaryUpdater(repository, name, filter, prefix)
    this.config = config
  }
  get cacheDir(){
    return this.updater.cacheDir
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
  async getLocalBinary(release) {

    const extractBinary = async (pkg, binaryName) => {
      const entries = await this.updater.getEntries(pkg)
      const binaryEntry = entries.find(e => e.relativePath.endsWith(binaryName))
      const destAbs = path.join(this.cacheDir, binaryName)
      // The unlinking might fail if the binary is e.g. being used by another instance
      if (fs.existsSync(destAbs)) {
        fs.unlinkSync(destAbs)
      }
      // IMPORTANT: if the binary already exists the mode cannot be set
      fs.writeFileSync(destAbs, await binaryEntry.file.readContent(), {
        mode: parseInt('754', 8) // strict mode prohibits octal numbers in some cases
      })
      return destAbs
    }

    release = release || await this.updater.getLatestCached()
    if (release) {
      // Binary in extracted form was found in e.g. standard location on the system
      if (release.isBinary) {
        return release.location
      } else {
        // Binary is packaged as .zip or.tar.gz -> extract first
        try {
          const binaryPath = await extractBinary(release, this.config.binaryName)
          return {
            binaryPath,
            packagePath: release.location
          } 
        } catch (error) {
          console.log('error during binary extraction', error)
        }
      }
    }
    console.warn('no binary found for', release)
    return {}
  }
}


class PluginProxy extends EventEmitter {
  constructor(plugin){
    super()
    this.plugin = plugin
  }
  get name(){
    return this.plugin.name
  }
  get displayName(){
    return this.plugin.displayName
  }
  get state(){
    // FIXME ugly
    return this.process ? this.process.state : 'STOPPED'
  }
  get isRunning() {
    return this.process && this.process.isRunning
  }
  get error(){
    return ''
  }
  getLogs() {
    return this.process ? this.process.logs : []
  }
  getReleases() {
    return this.plugin.getReleases()
  }
  download(release, onProgress) {
    return this.plugin.download(release, progress => {
      onProgress(progress)
    })
  }
  async start(release){
    const { binaryPath, packagePath } = await this.plugin.getLocalBinary(release)
    console.log(`client ${this.name} / ${packagePath} about to start - binary: ${binaryPath}`) 
    try {
      this.process = new ControlledProcess(binaryPath)
      // FIXME memory leaks start here:
      this.process.on('started', () => console.log('started!!!!') && this.emit('started'))
      this.process.on('log', arg => this.emit('log', arg))
      await this.process.start()
    } catch (error) {
      console.log('error start', error)      
    }
    return this.process
  }
  async stop(){
    console.log(`client ${this.name} stopped`)
    return this.process && this.process.stop()
  }
}

// TODO add file to electron packaged files
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
        if (fullPath.includes('geth') /*|| fullPath.includes('aleth') || fullPath.includes('parity')*/) {
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