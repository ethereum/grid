import { Application } from 'spectron'
import * as path from 'path'

const debug = false

class ApplicationFactory {
  static development() {
    const params = {
      path: path.resolve('./node_modules/.bin/electron'),
      // path: path.resolve('./node_modules/electron/dist/Electron.app/Contents/MacOS/electron'),
      args: [path.resolve('./index.js')],
      requireName: 'electronRequire',
      startTimeout: 10000,
      chromeDriverLogPath: path.resolve(
        __dirname,
        '/test/e2e/chromedriver.log'
      ),
      webdriverLogPath: path.resolve(__dirname, '/test/e2e/webdriver.log)')
    }

    debug && console.log('development() app parameters', params)
    return new Application(params)
  }

  static release() {
    const params = {
      startTimeout: 20000
    }

    switch (process.platform) {
      case 'win32': {
        params.path = path.resolve('./release/win-unpacked/Grid.exe')
        break
      }
      case 'linux': {
        params.path = path.resolve('./release/linux-unpacked/grid')
        break
      }
      case 'darwin': {
        params.path = path.resolve('./release/mac/Grid.app/Contents/MacOS/Grid')
        break
      }
    }

    debug && console.log('installed() app parameters', params)
    return new Application(params)
  }

  static installed() {
    const params = {
      path: '/Applications/Grid.app/Contents/MacOS/Grid'
    }
    debug && console.log('installed() app parameters', params)
    return new Application(params)
  }
}
export default ApplicationFactory
