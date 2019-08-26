const findIpcPathInLogs = logs => {
  let ipcPath
  for (const logPart of logs) {
    const found = logPart.includes('JSON-RPC socket path:')
    console.log('found', found)
    if (found) {
      ipcPath = logPart.split(': ')[1].trim()
      // fix double escaping
      if (ipcPath.includes('\\\\')) {
        ipcPath = ipcPath.replace(/\\\\/g, '\\')
      }
      console.log('Found IPC path: ', ipcPath)
      return ipcPath
    }
  }
  console.log('IPC path not found in logs', logs)
  return null
}

module.exports = {
  type: 'client',
  order: 3,
  displayName: 'Aleth',
  name: 'aleth',
  filter: {
    name: {
      excludes: ['alpha', 'rc', 'dev']
    }
  },
  repository: 'https://github.com/ethereum/aleth',
  binaryName: 'aleth',
  prefix: process.platform,
  resolveIpc: logs => findIpcPathInLogs(logs),
  settings: [
    {
      id: 'network',
      label: 'Network',
      default: 'mainnet',
      options: [
        { value: 'mainnet', label: 'Main', flag: '--mainnet' },
        {
          value: 'ropsten',
          label: 'Ropsten (testnet)',
          flag: '--ropsten'
        }
      ]
    }
  ],
  about: {
    description:
      'Aleth is a collection of C++ libraries and tools for Ethereum, formerly known as cpp-ethereum.',
    apps: [
      {
        name: 'RPC Tester App',
        url: 'package://github.com/ryanio/grid-rpc-app',
        dependencies: [
          {
            name: 'aleth',
            settings: []
          }
        ]
      }
    ],
    links: [
      {
        name: 'GitHub Repository',
        url: 'https://github.com/ethereum/aleth'
      }
    ],
    docs: [
      {
        name: 'Aleth Docs',
        url: 'https://github.com/ethereum/aleth/blob/master/doc/index.rst'
      }
    ],
    community: [
      {
        name: 'Gitter Chat',
        url: 'https://gitter.im/ethereum/aleth'
      }
    ]
  }
}
