const { app, Menu, MenuItem, protocol } = require('electron')
const { DialogUpdater, AppUpdater } = require('@philipplgh/electron-app-updater')

const startElectronShell = require('./electron-shell')

// interface of log, warn, error
const logger = console

// hw acceleration can cause problem in VMs and in certain APIs
app.disableHardwareAcceleration()

// setup updater for app.asar / app.zip
const appUpdater = new AppUpdater({ //new DialogUpdater({
  repo: 'https://github.com/ethereum/mist-ui-react',
  hasMetadata: true,
  auto: false,
  interval: 10,
  logger: logger
})

// setup updater for shell
const shellUpdater = new DialogUpdater({
  repo: 'https://github.com/PhilippLgh/mist-react',
  shell: true,
  auto: false,
  interval: 60,
  logger: logger
})

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


const is = {
  dev: () => process.env.NODE_ENV && (process.env.NODE_ENV.trim() == 'development'),
  prod: () => !is.dev()
}

const start = async () => {
  if (is.dev()) {
    console.log('started in dev mode')

    /*
    try {
      let config = require('./config.json')
    } catch (error) {
      console.log('no config.json found')
      process.exit(9)
    }
    */
    // 1.) try to load .asar within build dir

    // 2.) try to load from build dir

    // 3.) try to load .asar from __dirname

    // 4.) try to load remote

    // TODO DO NOT load script on main process unless it can be done is safe way:
    // require(path.join(config.repo, 'main.js'))
  }
  else if (is.prod()) {
    console.log('started in prod mode')

  }

  startElectronShell(appUpdater)

}
start()


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)

// TODO remove and handle in app
app.on('ready', () => {
  let menuNew = new Menu();

  let subMenu = new Menu();
  // subMenu.append(new MenuItem({ label: 'Check Update App', click: appUpdater.checkForUpdates.bind(appUpdater) }))
  // subMenu.append(new MenuItem({ label: 'Check Update Shell', click: shellUpdater.checkForUpdates }))

  // add delete cache option

  menuNew.append(new MenuItem({ label: 'Updater', submenu: subMenu }));
  Menu.setApplicationMenu(menuNew);

})
