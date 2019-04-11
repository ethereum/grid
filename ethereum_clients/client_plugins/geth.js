let platform = 'windows'
let dataDir = `${process.env.APPDATA}/Ethereum`

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
  default: {
  }
}

module.exports = {
  displayName: 'Geth',
  name: 'geth',
  repository: 'https://gethstore.blob.core.windows.net',
  filter: {
    name: {
      exclude: ['unstable', 'alltools', 'swarm'],
      include: [platform]
    },
    version: ''
  },
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
