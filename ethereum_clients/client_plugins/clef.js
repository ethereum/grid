let keystoreDir = `${process.env.APPDATA}/Ethereum/keystore`
let platform = 'windows'

// Platform specific initialization
switch (process.platform) {
  case 'win32': {
    platform = 'windows'
    keystoreDir = `${process.env.APPDATA}/Ethereum/keystore`
    break
  }
  case 'linux': {
    platform = 'linux'
    keystoreDir = '~/.ethereum/keystore'
    break
  }
  case 'darwin': {
    platform = 'darwin'
    keystoreDir = '~/Library/Ethereum/keystore'
    break
  }
  default: {
  }
}

module.exports = {
  type: 'signer',
  order: 4,
  displayName: 'Clef',
  name: 'clef',
  repository: 'https://gethstore.blob.core.windows.net',
  filter: {
    version: '>=1.9.0' // only included in alltool package after (>=) 1.9.0
  },
  prefix: `geth-alltools-${platform}`,
  binaryName: process.platform === 'win32' ? 'clef.exe' : 'clef',
  requestMethods: [
    'ui_approveTx',
    'ui_approveSignData',
    'ui_approveListing',
    'ui_approveNewAccount',
    'ui_onInputRequired'
  ],
  notificationMethods: [
    'ui_showInfo',
    'ui_showError',
    'ui_onApprovedTx',
    'ui_onSignerStartup'
  ],
  config: {
    default: {
      keystoreDir,
      chainId: 1,
      api: 'rpc'
    },
    flags: {
      '--keystore': 'path',
      '--chainId': 'string',
      '--rpc': '',
      '--rpcaddr': 'string',
      '--rpcport': 'string',
      '--ipcdisable': '',
      '--stdio-ui': '',
      '--stdio-ui-test': '',
      '--advanced': ''
    }
  },
  settings: {
    // keystoreDir: {
    //   default: keystoreDir,
    //   label: 'Keystore Directory',
    //   flag: '--keystore %s',
    //   type: 'path'
    // },
    chainId: {
      default: '1',
      label: 'Chain ID',
      flag: '--chainid %s'
    },
    api: {
      default: 'rpc',
      label: 'API',
      options: [
        {
          value: 'rpc',
          label: 'RPC HTTP',
          flag: '--rpc --ipcdisable --stdio-ui --stdio-ui-test'
        },
        { value: 'ipc', label: 'IPC', flag: '' }
      ]
    }
  }
}
