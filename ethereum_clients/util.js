const fs = require('fs')
const path = require('path')
const { AppManager } = require('@philipplgh/electron-app-manager')

const getUserDataPath = () => {
  const USER_DATA_PATH = 'electron' in process.versions
    ? require('electron').app.getPath('userData')
    : path.join(process.env.APPDATA, 'grid')
  if (!fs.existsSync(USER_DATA_PATH)) {
    fs.mkdirSync(USER_DATA_PATH)
  }
  return USER_DATA_PATH
}

const getCachePath = (name) => {
  let cachePath
  if (process.env.NODE_ENV === 'test') {
    cachePath = path.join(__dirname, '/../test', 'fixtures', `bin_${name}`)
  } else if (process.env.NODE_ENV === 'development') {
    cachePath = path.join(__dirname, `bin_${name}`)
  } else {
    const USER_DATA_PATH = getUserDataPath()
    cachePath = path.join(USER_DATA_PATH, `bin_${name}`)
  }

  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath)
  }

  return cachePath

}

const getBinaryUpdater = (repo, name, cachePath) => {

  if (!cachePath) {
    cachePath = getCachePath(name)
  }

  let excludes = ['alltools', 'swarm', 'unstable']
  let includes = ['windows']

  let count = 0

  return new AppManager({
    repository: repo,
    auto: false,
    paths: [],
    cacheDir: cachePath,
    filter: ({ fileName }) => {
      fileName = fileName.toLowerCase()
      return includes.every(val => fileName.indexOf(val) >= 0) && excludes.every(val => fileName.indexOf(val) === -1)
    }
  })
}

module.exports = {
  getCachePath,
  getBinaryUpdater
}