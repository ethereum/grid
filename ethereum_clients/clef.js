const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { AppManager } = require('@philipplgh/electron-app-manager')

let CLEF_CACHE
if (process.env.NODE_ENV === 'test') {
  CLEF_CACHE = path.join(__dirname, '/../test', 'fixtures', 'clef_bin')
} else {
  CLEF_CACHE = path.join(__dirname, 'clef_bin')
}

let URL_FILTER = ''
let EXT_LENGTH = 0
let BINARY_NAME = ''
switch (process.platform) {
  case 'win32': {
    URL_FILTER = 'windows'
    EXT_LENGTH = '.zip'.length
    BINARY_NAME = 'clef.exe'
    break
  }
  case 'linux': {
    URL_FILTER = 'linux'
    EXT_LENGTH = '.tar.gz'.length
    BINARY_NAME = 'clef'
    break
  }
  case 'darwin': {
    URL_FILTER = 'darwin'
    EXT_LENGTH = '.tar.gz'.length
    BINARY_NAME = 'clef'
    break
  }
  default: {
  }
}

const clefUpdater = new AppManager({
  repository: 'https://gethstore.blob.core.windows.net',
  modifiers: {
    version: ({ version }) =>
      version
        .split('-')
        .slice(0, -1)
        .join('-')
  },
  filter: ({ fileName }) =>
    fileName.includes('alltools') &&
    (URL_FILTER && fileName.includes(URL_FILTER)),
  auto: false,
  paths: [],
  cacheDir: CLEF_CACHE
})

const start = async () => {
  let latest = null
  // first, download or find the latest local binaries
  const cached = await clefUpdater.getLatestCached()
  if (cached) {
    latest = cached
  } else {
    const release = await clefUpdater.getLatest('>=1.9.0')
    latest = await clefUpdater.download(release)
  }

  // get the package name - we need it to build the path to the clef binary
  const basePackageName = latest.fileName.slice(0, -EXT_LENGTH)

  // retrieve the AppPackage object for the downloaded or cached IRelease
  const pkg = await clefUpdater.getLocalPackage(latest)

  // for debugging
  // let entries = await pkg.getEntries()
  // console.log('pkg entries', entries)

  // build relative path in pkg e.g. : 'geth-alltools-windows-amd64-1.9.0-unstable-f82185a4/clef.exe'
  const binaryPathInPackage = basePackageName + '/' + BINARY_NAME

  // load binary from package
  const gethBinaryEntry = await pkg.getEntry(binaryPathInPackage)
  const { file } = gethBinaryEntry

  // extract binary from package and write to cache
  const binaryPathDisk = path.join(CLEF_CACHE, basePackageName)
  fs.writeFileSync(binaryPathDisk, await file.readContent(), {
    mode: parseInt('754', 8) // strict mode prohibits octal numbers in some cases
  })

  // Spawn process
  console.log('start clef binary', binaryPathDisk)

  const flags = ['ok']
  const proc = spawn(binaryPathDisk, flags)
  const { stdout, stderr, stdin } = proc

  const onData = data => {
    console.log('clef output:', data.toString())
  }

  stdout.on('data', onData.bind(this))
  stderr.on('data', onData.bind(this))

  setTimeout(() => {
    // clef is expecting an 'ok' for early version
    stdin.write('ok\n')
    stdin.end()
  }, 3000)
}

start().catch(console.log)
