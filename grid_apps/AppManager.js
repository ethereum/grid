const createRenderer = require('../electron-shell')

class AppManager {
  getAvailableApps() {
    const apps = require('./apps.json')
    return apps
  }
  launch(app) {
    console.log('launch', app.name)
    let url = app.url || 'http://localhost:3000'
    const mainWindow = createRenderer(`http://localhost:3080/index.html`, {
      url,
      isApp: true
    })
  }
}

const registerGlobalAppManager = () => {
  global.AppManager = new AppManager()
  return global.AppManager
}

module.exports.registerGlobalAppManager = registerGlobalAppManager

module.exports.AppManager = AppManager
