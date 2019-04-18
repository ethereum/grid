const HOME = require('os').homedir()
let BASE
switch (process.platform) {
  case 'win32': {
    BASE = `${process.env.USERPROFILE}/AppData/Roaming/Parity/Ethereum`
    break
  }
  case 'linux': {
    BASE = '~/.local/share/io.parity.ethereum'
    break
  }
  case 'darwin': {
    // WARNING don't just use ~/Library/.. here
    BASE = `${HOME}/Library/Application Support/io.parity.ethereum`
    break
  }
  default: {
  }
}

const IPC_PATH = `${BASE}/jsonrpc.ipc`

module.exports = {
  type: 'client',
  order: 2,
  displayName: 'Parity',
  name: 'parity',
  // repository: 'https://github.com/paritytech/parity-ethereum'
  repository: 'https://github.com/PhilippLgh/EthCapetownWorkshop',
  prefix: `${process.platform}`, // filter github assets
  binaryName: process.platform === 'win32' ? 'parity.exe' : 'parity',
  resolveIpc: logs => IPC_PATH,
  config: {
    default: {
      '--ipc-path': IPC_PATH
    }
  }
}
