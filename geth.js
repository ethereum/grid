const fs = require('fs')
const path = require('path')
const { AppManager } = require('@philipplgh/electron-app-manager')
// const util = require('util')
// const spawn = util.promisify(require('child_process').spawn)
const { spawn } = require('child_process')
const { EventEmitter } = require('events')

const axios = require('axios')
const post = axios.post

let EXT_LENGTH = 0
let BINARY_NAME = ''

const GETH_CACHE = path.join(__dirname, 'geth_bin')
if(!fs.existsSync(GETH_CACHE)){
  fs.mkdirSync(GETH_CACHE)
}

let urlFilter = ''
let dataDir = ''
let binaryPaths = []

// platform specific initialization 
switch(process.platform){
  case 'win32': {
    urlFilter = 'win'
    EXT_LENGTH = '.zip'.length
    BINARY_NAME = 'geth.exe'
    dataDir = '%APPDATA%\\Ethereum'
    break;
  }
  case 'linux': {
    urlFilter = 'linux'
    EXT_LENGTH = '.tar.gz'.length
    BINARY_NAME = 'geth'
    dataDir = '~/.ethereum'
    break;
  }
  case 'darwin': {
    urlFilter = 'darwin'
    EXT_LENGTH = '.tar.gz'.length
    BINARY_NAME = 'geth'
    dataDir = '~/Library/Ethereum'
    break;
  }
  default: {

  }
}

const gethUpdater = new AppManager({
  repository: 'https://gethstore.blob.core.windows.net',
  modifiers: {
    version: ({ version })  => version.split('-').slice(0, -1).join('-')
  },
  filter: ({fileName}) => !fileName.includes('alltools') && (urlFilter && fileName.includes(urlFilter)),
  auto: false,
  paths: [],
  cacheDir: GETH_CACHE
})

const defaultConfig = {
  name: 'default',
  dataDir,
  host: 'localhost',
  port: 8545,
  network: 'main'
}

let id = 1
const rpcCall = async call => {
  let url = 'http://127.0.0.1:8545'
  let obj = {
    "jsonrpc":"2.0",
    "method": call.method,
    "id": id++
  }
  let response = await post(url, obj)
  return response.data
}

// https://github.com/ethereum/ethereum-client-binaries
// https://github.com/ethereumjs/geth.js/blob/master/index.js
// https://github.com/ethereum/ethereum-client-binaries/blob/master/src/index.js
// https://github.com/ethereum/mist/blob/develop/modules/ethereumNode.js
class Geth extends EventEmitter{
  constructor() {
    super()
    this.isRunning = false
    this.flags = []
  }
  async getLocalBinary() {
    const latestCached = await gethUpdater.getLatestCached()
    if(latestCached){
      // binary in extracted form was found in e.g. standard location on the system
      if(latestCached.isBinary){
        return latestCached.location
      } 
      // binary is packaged as .zip or.tar.gz
      else {
        // on mac the tar contains as root entry a dir with the same name as the .tar.gz
        const basePackageName = latestCached.fileName.slice(0, -EXT_LENGTH)
        const binaryPathPackage = path.join(basePackageName, BINARY_NAME)
        const gethBinary = await gethUpdater.getEntry(latestCached, binaryPathPackage)
        const binaryPathDisk = path.join(GETH_CACHE, basePackageName)

        // the unlinking might fail if the binary is e.g. being used by another instance
        if(fs.existsSync(binaryPathDisk)){
          fs.unlinkSync(binaryPathDisk)
        }
        // IMPORTANT: if the binary already exists the mode cannot be set
        fs.writeFileSync(binaryPathDisk, await gethBinary.getData(), {
          mode: parseInt('754', 8) // strict mode prohibits octal numbers in some cases
        })
        
        return binaryPathDisk
      }
    }
    return null
  }
  async getLocalBinaries() {
    return await gethUpdater.cache.getReleases()
  }
  async download(release, onProgress) {
    if(!release){
      release = await gethUpdater.getLatestRemote()
    }
    const _onProgress = (r, p) => onProgress(p)
    gethUpdater.on('update-progress', _onProgress)
    await gethUpdater.download(release)
    gethUpdater.removeListener(_onProgress)
  }
  getUpdaterMenu(){
    return createMenu(updater)
  }
  configure() {

  }
  async start(binPath) {
    console.log('start geth', binPath)
    let flags = [
      // '--datadir', 'F:/Ethereum',
      '--rpc'
    ]
    // const { stdout, stderr } = await spawn(this.bin, {})
    const proc = spawn(binPath, flags)
    const {stdout, stderr} = proc
    proc.once('error', error => {
      console.log('error in geth process', error)
    })
    stdout.on("data", (data) => {
      console.log('received data', data.toString())
    });
    stderr.on("data", (data) => {
      console.log('received error', data.toString())
    })
    this.proc = proc
    this.isRunning = true

    return this.getStatus()
  }
  async restart() {

  }
  async stop() {
    this.proc.kill('SIGINT')
    this.isRunning = false
    return this.getStatus()
  }
  async checkForUpdates() {
    let result = await updater.checkForUpdates()
    return result
  }
  async getReleases(){
    return await gethUpdater.getReleases()
  }
  setConfig(newConfig) {

  }
  async getConfig() {
    return defaultConfig
  }
  async getStatus() {
    return {
      node: 'geth',
      binPath: this.binPath,
      version: '1.8.20-stable',
      commit: '24d727b6d6e2c0cde222fa12155c4a6db5caaf2e',
      architecture: 'amd64',
      go: 'go1.11.2',
      isRunning: this.isRunning
    }
  }
  async rpc(call){
    let response = await rpcCall(call)
    return response
  }
  reportBug() {

  }
  license() {

  }
  async network() {
    let response = await rpcCall('net_version')
    return response
  }
  async version() {
  }
  import() {

  }
  export() {

  }
}

module.exports = Geth
