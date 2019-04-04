module.exports = {
  // if useDevSettings = false, below settings will be ignored
  useDevSettings: true,
  // the shell will first try to load package from local source
  packagePath: '/path/to/package/pkg_0.1.25.zip',
  // then it will test for package servers
  packageServer: 'http://localhost:3080',
  // finally, it will check for hosted packages
  packageUrl:
    'https://github.com/ethereum/grid-ui/releases/tag/v0.1.25-alpha_1549384830',
  // if packagePath, packageServer, and packageUrl are not defined the shell can be pinned to a specific version
  packageVersion: '0.1.25-alpha'
}
