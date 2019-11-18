const Grid = require('grid-core').default
const { ClientManager } = require('grid-core')

let _id = 0

const createRpcClient = () => {
  let handler = {
    get(target, propKey, receiver) {
      const methodName = propKey
      const origMethod = target[propKey]
      // check that orgMethod is function
      return async function(...args) {
        // let result = origMethod.apply(this, args);
        // console.log(propKey + JSON.stringify(args) + ' -> ' + JSON.stringify(result));
        // return result;

        try {
          const opts = {
            jsonrpc: '2.0',
            method: methodName,
            params: args,
            id: _id++
          }
          const response = await fetch(`http://localhost:8081/rpc`, {
            method: 'post',
            body: JSON.stringify(opts)
          })
          const result = await response.json()

          if (methodName === 'getAllClientManagers') {
            // return result.map(r => new Proxy(new ClientManagerProxy(r), handler))
            return result.map(r => new ClientManager(r), handler)
          }
          return result
        } catch (error) {
          console.log('fetch / rpc error', error)
          return []
        }
      }
    },
    ownKeys: target => {
      // loadRemoteProperties()
      return Object.getOwnPropertyNames(target)
    },
    getOwnPropertyDescriptor: (target, property) => {
      const descriptor = Object.getOwnPropertyDescriptor(target, property)
      if (descriptor) return descriptor
      // loadRemoteProperties()
      return Object.getOwnPropertyDescriptor(target, property)
    }
  }
  return new Proxy(new Grid(), handler)
}

module.exports = createRpcClient
