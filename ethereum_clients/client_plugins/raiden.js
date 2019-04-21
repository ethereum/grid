const path = require('path')
// const platform = process.platform === 'win32' ? 'windows' : process.platform
const platform = process.platform === 'darwin' ? 'macOS' : process.platform

module.exports = {
  type: 'tools',
  order: 6,
  displayName: 'Raiden Network',
  name: 'raiden',
  repository: 'https://github.com/raiden-network/raiden',
  binaryName:
    process.platform === 'win32'
      ? 'raiden-v0.100.3-rc4-macOS-x86_64.exe'
      : 'raiden-v0.100.3-rc4-macOS-x86_64',
  prefix: `${platform}`,
  onInputRequested: (log, stdin) => {
    const acceptTerms =
      'Have you read, understood and hereby accept the above disclaimer and privacy warning?'
    if (log.startsWith(acceptTerms)) {
      console.log('plugin recognized input request for terms')
      stdin.write('Y\n')
    }
    if (log.startsWith('Select one of them by index to continue:')) {
      stdin.write('0\n')
    }
    if (log.startsWith('Enter the password')) {
      console.log('plugin recognized input request for password')
      stdin.write('test\n')
    }
  },
  config: {
    default: {
      Keystore: path.join(__dirname, '../bin_raiden/keystore'),
      Network: '5',
      Environment: 'development',
      EthAPI: 'http://localhost:8545'
    }
  },
  // ./raiden-v0.100.3-rc4-macOS-x86_64 --keystore-path keystore --network-id 5 --environment-type development --eth-rpc-endpoint http://localhost:8545
  settings: {
    Keystore: {
      default: path.join(__dirname, '../bin_raiden/keystore'),
      flag: '--keystore-path %s',
      type: 'path'
    },
    Network: {
      default: '5',
      options: [{ value: '5', label: 'Goerli', flag: '--network-id %s' }]
    },
    Environment: {
      default: 'development',
      options: [
        {
          value: 'development',
          label: 'Development',
          flag: '--environment-type %s'
        }
      ]
    },
    EthAPI: {
      label: 'Eth Endpoint',
      default: 'http://localhost:8545',
      flag: '--eth-rpc-endpoint %s'
    }
  },
  // ./geth --goerli -rpc --rpcapi eth,net,web3,txpool --rpccorsdomain http://127.0.0.1:5001
  //  geth --goerli --rpc --rpcapi eth,net,web3,txpool --rpccorsdomain http://127.0.0.1:5001
  dependencies: [
    {
      name: 'geth',
      // register a profile for geth
      profile: {
        name: 'Raiden',
        settings: {
          network: {
            default: 'goerli',
            options: [
              { value: 'main', label: 'Main', flag: '' },
              {
                value: 'ropsten',
                label: 'Ropsten (testnet)',
                flag: '--testnet'
              },
              {
                value: 'rinkeby',
                label: 'Rinkeby (testnet)',
                flag: '--rinkeby'
              },
              { value: 'goerli', label: 'Goerli (testnet)', flag: '--goerli' }
            ]
          },
          api: {
            // FIXME needs to be ipc to provide --rpc
            default: 'ipc',
            label: 'API',
            options: [
              // FIXME needs to be named ipc to provide --rpc
              { value: 'ipc', label: 'IPC', flag: '--rpc' },
              { value: 'websockets', label: 'WebSockets', flag: '--ws' },
              { value: 'rpc', label: 'RPC HTTP', flag: '--rpc' }
            ]
          },
          apiScopes: {
            default: 'eth,net,web3,txpool',
            label: 'API Scopes',
            flag: '--rpcapi %s  '
          },
          cors: {
            label: 'RPC Cors',
            default: 'http://127.0.0.1:5001',
            flag: '--rpccorsdomain %s'
          }
        }
      }
    }
  ]
}
