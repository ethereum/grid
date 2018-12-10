const url = require('url')
const AdmZip = require('adm-zip')
const { app, protocol } = require('electron')

let zipFs = { }

function parseZip(zip){
  if (typeof zip === 'string') {
    zip = new AdmZip(zipPath)
  }
  zipFs = {} // reset old data
  const zipEntries = zip.getEntries()
  zipEntries.forEach(zipEntry =>  zipFs[zipEntry.entryName] = zipEntry)
}

function getFilePath(request) {
  const uri = url.parse(request.url)
  let filePath = decodeURIComponent(uri.pathname)
  // pathname has a leading '/' on Win32 for some reason
  if (process.platform === 'win32') {
    filePath = filePath.slice(1)
  }
  return filePath
}

function registerProtocolHandler() {
  protocol.interceptBufferProtocol('file', (request, handler) => {
    const filePath = getFilePath(request)
    const zipPath = filePath.indexOf(".zip")
    const fileRelPath = filePath.substr(zipPath + 4 + 1) //path/to/file.zip/index.html '.zip'=4 '/'=+1  => index.html
    const file = zipFs[fileRelPath]

    if (file) {
      const content = file.getData()
      handler(content)
    } else {
      handler(-2)
    }

  }, (error) => {
    if (error) console.error('Failed to register protocol')
  })
}

function addZipSupport(zip) {
  const init = () => {
    parseZip(zip)
    registerProtocolHandler(zip)
  }

  if(app.isReady()) {
    init()
  } else (
    app.once('ready', init)
  )
}

module.exports = addZipSupport
