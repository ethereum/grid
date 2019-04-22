const platform = process.platform === 'win32' ? 'windows' : process.platform

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
  config: {
    default: {
      init: 'yes'
    }
  },
  settings: {
    init: {
      label: 'Accept Warning',
      default: 'yes',
      options: [
        { label: 'Yes', value: 'yes', flag: '<<< "ok"' },
        { label: 'No', value: 'no', flag: '<<< "no"' }
      ]
    }
  }
}
