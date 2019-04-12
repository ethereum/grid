let platform = 'windows'
let dataDir = `${process.env.APPDATA}/Ethereum`

// Platform specific initialization
switch (process.platform) {
  case 'win32': {
    platform = 'windows'
    dataDir = `${process.env.APPDATA}/Ethereum`
    break
  }
  case 'linux': {
    platform = 'linux'
    dataDir = '~/.ethereum'
    break
  }
  case 'darwin': {
    platform = 'darwin'
    dataDir = '~/Library/Ethereum'
    break
  }
  default: {}
}

module.exports = {
  displayName: 'Geth',
  name: 'geth',
  repository: 'https://gethstore.blob.core.windows.net',
  modifiers: {
    version: ({ version }) => version.split('-').slice(0, -1).join('-')
  },
  filter: {
    name: {
      excludes: ['unstable', 'alltools', 'swarm'],
      includes: [platform]
    }
  },
  prefix: `&prefix=geth-${platform}`,
  binaryName: process.platform === 'win32' ? 'geth.exe' : 'geth',
  config: {
    default: {
      name: 'default',
      dataDir,
      host: 'localhost',
      port: 8546,
      network: 'main',
      syncMode: 'light',
      ipc: 'ipc'
    }
  }
}
