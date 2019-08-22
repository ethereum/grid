module.exports = {
  type: 'client',
  order: 3,
  displayName: 'Aleth',
  name: 'aleth',
  repository: 'https://github.com/ethereum/aleth',
  binaryName: 'aleth',
  prefix: process.platform,
  about: {
    description:
      'Aleth is a collection of C++ libraries and tools for Ethereum, formerly known as cpp-ethereum.',
    apps: [
      {
        name: 'RPC Tester App',
        url: 'package://github.com/ryanio/grid-rpc-app'
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
