class Node {
  constructor (client) {
    this.client = client
  }

  toggle(nodeName) {
    return this.client.click(`[data-test-id=switch-${nodeName}]`)
  }

  waitUntilStarted() {
    return this.client.waitUntilTextExists('[data-test-id=node-state]', 'STARTED')
  }

  waitUntilStopped() {
    return this.client.waitUntilTextExists('[data-test-id=node-state]', 'STOPPED')
  }

}

export default Node
