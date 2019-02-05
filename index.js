const fs = require('fs')
const path = require('path')

const createRenderer = require('./electron-shell')
const Geth = require('./ethereum_clients/geth')
const { setupRpc } = require('./Rpc')
const { getMenuTemplate } = require('./Menu')

const { app, Menu, MenuItem, protocol, ipcMain, shell } = require('electron')
// const { DialogUpdater, AppUpdater, createMenu } = require('@philipplgh/electron-app-updater')
const {AppManager}= require('@philipplgh/electron-app-manager')

// interface of log, warn, error
const logger = console

// hw acceleration can cause problem in VMs and in certain APIs
app.disableHardwareAcceleration()

/*

// setup updater for shell
const shellUpdater = new DialogUpdater({
  repo: 'https://github.com/PhilippLgh/mist-react',
  shell: true,
  auto: false,
  interval: 60,
  logger: logger
})
*/

const WindowManager = require('./WindowManager')

const appManager = new AppManager({
  repository: 'https://github.com/ethereum/mist-ui',
  auto: false
})

const is = {
  dev: () => process.env.NODE_ENV && (process.env.NODE_ENV.trim() == 'development'),
  prod: () => !is.dev()
}

const hotLoadLatest = async () => {
  const appWindow = await appManager.hotLoadLatest(WindowManager.createWindow())
  // appWindow.webContents.openDevTools()
}

// Step 0
const initialize = async () => {

  const mistVersionMenu = [
    { 
      label: 'Version 1',
      click: async () => { console.log('load version 1') }
    },
    { 
      label: 'Version 2',
      click: async () => { console.log('load version 2') }
    }
  ]

  const updateMist = {
    label: 'Mist UI',
    submenu: [
      { 
        label: 'Check Update',
        click: async () => { console.log('check for updates') }
      },
      { type: 'separator' },
      { 
        label: 'Switch Version',
        submenu: mistVersionMenu
      },
      { 
        label: 'Hot-Load Latest',
        click: hotLoadLatest
      },
      { type: 'separator' },
      { 
        label: 'Open Cache',
        click: async () => { shell.showItemInFolder(appManager.cacheDir) }
      },
      { type: 'separator' },
      { 
        label: 'Version x.y.z',
        enabled: false
      }, 
    ]
  }

  const updateGeth = {
    label: 'Geth',
    submenu: [
      { 
        label: 'Check Update',
        click: async () => { console.log('check for updates') }
      },
      { 
        label: 'Choose Version',
        click: async () => { console.log('choose version') }
      },
      { 
        label: 'Open Cache',
        click: async () => { shell.showItemInFolder(updater.downloadDir) }
      }
    ]
  }

  // Create application menus
  const template = getMenuTemplate()
  const UpdateMenu = template.find(mItem => mItem.label === 'Updater')
  UpdateMenu.submenu.push(
    updateMist,
    updateGeth,
    {label: 'Shell'},
    {label: 'Settings'}
  )
  
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// Step 1
const startUI = async () => {
  if (is.dev()) {
    console.log('started in dev mode')
    const PORT = '3080'
    const startUrl = `http://localhost:${PORT}/index.html`
    createRenderer(startUrl)
  } 
  else if (is.prod()) {
    console.log('started in prod mode')
    await hotLoadLatest()
  }
}

// ########## MAIN APP ENTRY POINT #########
const onReady = async () => {

  // 0 prepare windows, menus etc
  await initialize()

  // 1. start UI for quick user-feedback without long init procedures
  await startUI()

  // 2. 
  const geth = new Geth()
  // make geth methods available in renderer
  // setupRpc('geth', geth)
  global.Geth = geth
  const gethBinary = await geth.getLocalBinary()
  if(gethBinary){
    //geth.start(gethBinary)
  }
  // else do nothing: let user decide how to setup

}
app.once('ready', onReady)

