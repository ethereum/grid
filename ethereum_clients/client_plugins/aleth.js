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
  resolveIpc: logs => findIpcPathInLogs(logs)
}
