class Node {
  constructor (client) {
    this.client = client
  }

  toggle(nodeName) {
    return this.client.click(`[data-test-id=switch-${nodeName}]`)
  }

  waitUntilStarted() {
    return this.client.waitUntilTextExists('[data-test-id=node-state]', 'STARTED', 3000)
  }

  waitUntilStopped() {
    return this.client.waitUntilTextExists('[data-test-id=node-state]', 'STOPPED', 3000)
  }

}

export default Node
