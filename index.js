const fs = require('fs')
const path = require('path')
const url = require('url')
const net = require('net')

const createRenderer = require('./electron-shell')
const Geth = require('./ethereum_clients/geth')
const { setupRpc } = require('./Rpc')
const { getMenuTemplate } = require('./Menu')

const log = {
  dev: require('debug')('dev'),
  appManager: {
    log: require('debug')('AppManager')
  }
}

const { app, dialog, Menu } = require('electron')

const { AppManager } = require('@philipplgh/electron-app-manager')

const CONFIG_NAME = '.shell.config.js'

// hw acceleration can cause problem in VMs and in certain APIs
app.disableHardwareAcceleration()

const WindowManager = require('./WindowManager')
// TODO move into WindowManager
let mainWindow = null

const appManager = new AppManager({
  repository: 'https://github.com/ethereum/grid-ui',
  auto: false,
  logger: log.appManager,
  policy: {
    onlySigned: false
  }
})

const shellManager = new AppManager({
  repository: 'https://github.com/ethereum/grid',
  auto: true,
  electron: true
})

const is = {
  dev: () =>
    process.env.NODE_ENV && process.env.NODE_ENV.trim() == 'development',
  prod: () => !is.dev()
}

const updateMenuVersion = async release => {
  const updateMenuMist = await appManager.updateMenuVersion(release.version)
  updateMenuMist.label = 'Grid UI'

  const template = getMenuTemplate()
  const UpdateMenu = template.find(mItem => mItem.label === 'Updater')
  UpdateMenu.submenu.push(
    updateMenuMist,
    { label: 'Geth' },
    { label: 'Shell' },
    { label: 'Settings' }
  )

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

const initializeMenu = async geth => {
  const onReload = appUrl => {
    // console.log('reload requested for url', appUrl)
    mainWindow.loadURL(appUrl)
  }
  const updateMenuMist = await appManager.createMenuTemplate(onReload)
  // console.log('mist menu', updateMenuMist)
  updateMenuMist.label = 'Grid UI'

  const gethUpdater = geth.getUpdater()
  const updateMenuGeth = await gethUpdater.createMenuTemplate(onReload)
  updateMenuGeth.label = 'Geth'

  // Create application menus
  const template = getMenuTemplate()
  const UpdateMenu = template.find(mItem => mItem.label === 'Updater')
  UpdateMenu.submenu.push(
    updateMenuMist,
    updateMenuGeth,
    { label: 'Shell' },
    { label: 'Settings' }
  )

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// TODO util
const checkConnection = async (host, port, timeout = 2000) => {
  return new Promise((resolve, reject) => {
    let timer = setTimeout(() => {
      reject('timeout')
      socket.end()
    }, timeout)
    let socket = net.createConnection(port, host, () => {
      clearTimeout(timer)
      resolve(true)
      socket.end()
    })
    socket.on('error', err => {
      clearTimeout(timer)
      resolve(false)
    })
  })
}

// Step 0
const initialize = async geth => {
  // IMPORTANT don't await here: menu construction will defer startup
  initializeMenu(geth)
}

// Step 1 - configure and start user interface
const startWithDevConfig = async appUrl => {
  const {
    packagePath,
    packageServer,
    packageUrl,
    packageVersion
  } = require(`./${CONFIG_NAME}`)
  // test if local path configured
  if (packagePath && fs.existsSync(packagePath)) {
    log.dev('load user provided package from fs:', packagePath)
    appUrl = await appManager.load(packagePath)
  }
  // test if user provided server is defined and reachable
  else if (packageServer) {
    const { hostname, port } = url.parse(packageServer)
    const isServerRunning = await checkConnection(hostname, port)
    if (isServerRunning) {
      log.dev('load user provided package url:', packageServer)
      appUrl = packageServer
    } else {
      log.dev('user provided server unreachable:', packageServer)
    }
  }
  // fallback to user defined package url
  else if (packageUrl) {
    throw Error('not implemented')
  } else if (packageVersion) {
    log.dev('load user provided version:', packageVersion)
    const releases = await appManager.getReleases()
    // console.log(releases.map(r => r.version).join(', '))
    const release = releases.find(r => r.version === packageVersion)
    if (release) {
      appUrl = await appManager.hotLoad(release)
    } else {
      log.dev('user provided version not found')
    }
  }
  // else: display error: module not found
  mainWindow = createRenderer(appUrl)
}
const startUI = async () => {
  let errorUrl = url.format({
    slashes: true,
    protocol: 'file:',
    pathname: path.join(__dirname, 'public', 'error.html')
  })

  if (is.dev()) {
    // load user-provided package if possible
    if (fs.existsSync(path.join(__dirname, CONFIG_NAME))) {
      const { useDevSettings } = require(`./${CONFIG_NAME}`)
      if (useDevSettings) {
        return startWithDevConfig(errorUrl)
      }
    }
    // else:  no dev config found or deactivated -> use default = dev server
    const PORT = '3080'
    const appUrl = `http://localhost:${PORT}/index.html`
    const isServerRunning = await checkConnection('localhost', PORT)
    if (!isServerRunning) {
      log.dev('dev server unreachable at:', appUrl)
      dialog.showMessageBox({
        title: 'Error',
        message: 'Dev Server not running or unreachable at: ' + appUrl
      })
      return
    }
    // else: server running -> display app
    mainWindow = createRenderer(appUrl)

    updateMenuVersion(latest)

    return
  }

  // else is production:
  const appUrl = await appManager.hotLoadLatest()
  if (appUrl) {
    let current = appManager.hotLoadedApp
    if (current) {
      updateMenuVersion(current)
      mainWindow = createRenderer(appUrl)
    }
    return
  }
  // else: no valid app url -> display error
  mainWindow = createRenderer(errorUrl)
}

// ########## MAIN APP ENTRY POINT #########
const onReady = async () => {
  // 0 prepare windows, menus etc
  const geth = new Geth()
  await initialize(geth)

  // 1. start UI for quick user-feedback without long init procedures
  await startUI()

  // 2. make geth methods available in renderer
  // setupRpc('geth', geth)
  global.Geth = geth
  const gethBinary = await geth.getLocalBinary()
  if (gethBinary) {
    //geth.start(gethBinary)
  }
  // else do nothing: let user decide how to setup
}
app.once('ready', onReady)
