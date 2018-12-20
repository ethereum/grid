const { ipcRenderer } = require('electron')

// https://www.jsonrpc.org/specification
class Rpc {
  constructor() {
    this.id = 1
  }
  async send(method, args) {
    let _id = this.id++
    ipcRenderer.send('rpc', {"jsonrpc": "2.0", "method": method, "params": args, "id": _id})
    return new Promise((resolve, reject) => {
      let timeoutHandler = undefined
      let responseHandler = (ev, response) => {
        if(timeoutHandler){
          clearInterval(timeoutHandler)
        }
        // response belongs to corresponding request above: ipcRenderer.send
        if(response.id === _id){
          ipcRenderer.removeListener('rpc', responseHandler)
          if(response.error){
            reject(response.error)
          } else if('result' in response){
            resolve(response.result)
          } else {
            // malformed
          }
        } 
      }
      ipcRenderer.on('rpc', responseHandler)
      // auto-unsubscribe after timeout to avoid memory leak
      timeoutHandler = setTimeout(()=>{
        ipcRenderer.removeListener('rpc', responseHandler)
        reject(new Error('rpc timed out'))
      }, 2000)
    })
  }
}

module.exports = new Rpc()
