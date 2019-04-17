const fs = require('fs')
const path = require('path')
const { EventEmitter } = require('events')
const { getBinaryUpdater } = require('./util')
const ControlledProcess = require('./ControlledProcess')

let rpcId = 1

class Plugin {
  constructor(config) {
    const { name, repository, filter, prefix } = config
    this.updater = getBinaryUpdater(repository, name, filter, prefix)
    this.config = config
    this.process = undefined
  }
  get cacheDir() {
    return this.updater.cacheDir
  }
  get name() {
    return this.config.name
  }
  get type() {
    return this.config.type
  }
  get order() {
    return this.config.order
  }
  get displayName() {
    return this.config.displayName
  }
  get state() {
    // FIXME ugly
    return this.process ? this.process.state : 'STOPPED'
  }
  get isRunning() {
    return this.process && this.process.isRunning
  }
  getLogs() {
    return this.process ? this.process.logs : []
  }
  get resolveIpc() {
    return this.config.resolveIpc
  }
  async getReleases() {
    const releases = await this.updater.getReleases()
    return releases
  }
  download(release, onProgress) {
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

    release = release || (await this.updater.getLatestCached())
    if (release) {
      // Binary in extracted form was found in e.g. standard location on the system
      if (release.isBinary) {
        return release.location
      } else {
        // Binary is packaged as .zip or.tar.gz -> extract first
        try {
          const binaryPath = await extractBinary(
            release,
            this.config.binaryName
          )
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
  async start(release, config, emitter) {
    // TODO do flag validation here based on proxy metadata
    const flags = []
    try {
      for (var flag in config) {
        let val = config[flag]
        // TODO plugin needs to tell plugin host flag format? e.g. network=1 vs --network 1
        flags.push(`${flag}`)
        flags.push(`${val}`)
      }
      console.log('start with flags: ', flags)
    } catch (error) {
      console.log('error in flag conversion', error)
    }

    const { binaryPath, packagePath } = await this.getLocalBinary(release)
    console.log(
      `client ${
        this.name
      } / ${packagePath} about to start - binary: ${binaryPath}`
    )
    try {
      this.process = new ControlledProcess(binaryPath, this.resolveIpc)
      // FIXME memory leaks start here:
      // forward all events from the spawned process
      let eventTypes = [
        'starting',
        'started',
        'connect',
        'error',
        'stopped',
        'log'
      ]
      eventTypes.forEach(eventName => {
        this.process.on(eventName, arg => {
          if (eventName !== 'log') {
            console.log(`forward external process event >> ${eventName}`)
          }
          emitter.emit(eventName, arg)
        })
      })

      await this.process.start(flags)
    } catch (error) {
      console.log('error start', error)
    }
    return this.process
  }
  async stop() {
    return this.process && this.process.stop()
  }
  // public json rpc
  async rpc(method, params = []) {
    if (!this.process) {
      console.log('error: rpc not available - process not running', this.state)
      return // FIXME error handling
    }
    const payload = {
      jsonrpc: '2.0',
      id: rpcId++,
      method,
      params
    }
    try {
      const result = await this.process.send(payload)
      return result
    } catch (error) {
      return error
    }
  }
  async checkForUpdates() {
    let result = await this.updater.checkForUpdates()
    return result
  }
}

class PluginProxy extends EventEmitter {
  constructor(plugin) {
    super()
    this.plugin = plugin
  }
  get name() {
    return this.plugin.name
  }
  get type() {
    return this.plugin.type
  }
  get order() {
    return this.plugin.order
  }
  get displayName() {
    return this.plugin.displayName
  }
  get state() {
    return this.plugin.state
  }
  get isRunning() {
    return this.plugin.isRunning
  }
  get error() {
    return ''
  }
  getLogs() {
    return this.plugin.getLogs()
  }
  getReleases() {
    return this.plugin.getReleases()
  }
  download(release, onProgress) {
    return this.plugin.download(release, progress => {
      onProgress(progress)
    })
  }
  getLocalBinary(release) {
    return this.plugin.getLocalBinary(release)
  }
  start(release, config) {
    return this.plugin.start(release, config, this)
  }
  stop() {
    console.log(`client ${this.name} stopped`)
    return this.plugin.stop()
  }
  rpc(method, params = []) {
    return this.plugin.rpc(method, params)
  }

  checkForUpdates() {
    return this.plugin.checkForUpdates()
  }
}

module.exports = {
  Plugin,
  PluginProxy
}
