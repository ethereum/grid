const { app, Menu, MenuItem } = require('electron')
const { DialogUpdater, AppUpdater } = require('electron-app-updater')

// interface of log, warn, error
const logger = console

const fs = require('fs')
const path = require('path')

const Module = require('module')

// hw acceleration can cause problem in VMs and in certain APIs
app.disableHardwareAcceleration()

// setup updater for shell
// setup updater for app.asar

/*
// TODO move to app code
const gethUpdater = new Updater({
  // https://gethstore.blob.core.windows.net/builds?restype=container&comp=list
  repo: 'https://gethstore.blob.core.windows.net',
  auto: true,
  interval: 60,
  useDialog: true,
  logger: logger
})
gethUpdater.checkForUpdates()
*/

const shellUpdater = new DialogUpdater({
  repo: 'https://github.com/PhilippLgh/mist-react',
  shell: true,
  auto: false,
  interval: 60,
  logger: logger
})

const appUpdater = new DialogUpdater({
  repo: 'https://github.com/ethereum/mist-ui-react',
  hasMetadata: true,
  auto: false,
  interval: 10,
  logger: logger
})

global.appUpdater = appUpdater

const is = {
  dev: () => process.env.NODE_ENV && (process.env.NODE_ENV.trim() == 'development'),
  prod:() => !is.dev()
}

const start = async () => {
  if(is.dev()){
    return
    try {
      let config = require('./config.json')
    } catch (error) {
      console.log('no config.json found')
      process.exit(9)
    }
    // 1.) try to load .asar within build dir
  
    // 2.) try to load from build dir
  
    // 3.) try to load .asar from __dirname
  
    // 4.) try to load remote
  
    // require(path.join(config.repo, 'main.js'))
  }
  else if(is.prod()){
    console.log('started in prod mode')
  
    // cached updated apps are always more up-to-date than the packaged app -> try to load first
   
    let cachedApp = await appUpdater.getCachedApp()
    if(cachedApp){
      let appPath = cachedApp.filePath
      try {
        // try to load from cache with fallback to packaged app
        console.log('try starting app from cache')
        loadApp(appPath)
      } catch (error) {
        console.log('starting cached app failed', error)
        loadPackagedApp()      
      }
  
    }
    // if appPath does not exist or is invalid etc. fallback to packaged app
    else{
      loadPackagedApp()
    }
  }
}
start()

/*
* the "packaged" app is the one that was shipped with this shell / which was part of the installation bundle
* contrary: updated apps are downloaded and cached by the updater some time after installation and are not always available
*/
function loadPackagedApp(){
  console.log('nothing cached or cache not working -> fallback to packaged app')
  let files = fs.readdirSync(__dirname)
  let asar = files.find(file => file.endsWith('.asar'))
  if(!asar){
    // fatal
    throw new Error("Bad installation: application is missing or cannot be found")
  }
  loadApp(path.join(__dirname, asar))
}

function loadApp(fullAsarPath){
    // TODO allow script to be renamed? use main from package.json?
    let mainScript = path.join(fullAsarPath, 'main.js')
    if(!fs.existsSync(mainScript)){
      // fatal
      throw new Error("Bad application: application has no entry point")
    }
    
    // start main script
    Module._load(mainScript, Module, true)
}

// TODO remove and handle in app
app.on('ready', () => {
  let menuNew = new Menu();

  let subMenu = new Menu();
  subMenu.append(new MenuItem({ label: 'Check Update App', click: appUpdater.checkForUpdates.bind(appUpdater) }))
  subMenu.append(new MenuItem({ label: 'Check Update Shell', click: shellUpdater.checkForUpdates }))

  menuNew.append(new MenuItem({ label: 'Updater', submenu: subMenu }));
  Menu.setApplicationMenu(menuNew);

})