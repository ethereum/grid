class VersionList {
  constructor(client) {
    this.client = client
  }

  get items() {
    return this.client.$$('[data-test-id=version-list] > [role=button]')
  }

  get self() {
    return this.client.$('[data-test-id=version-list]')
  }

  get localItems(){
    return this.client.$$('[data-test-id=version-list] > [data-test-is-downloaded=true]')
  }

  get remoteItems(){
    // return this.client.$(`[data-test-id=version-list] > [role=button]:nth-child(3)`)

    return this.client.$$('[data-test-id=version-list] > [data-test-is-downloaded=false]')
  }

  get selectedItem() {
    return this.client.$(this.selectedItemSelector)
  }

  get selectedItemSelector() {
    return '[data-test-id=version-list] > [data-test-is-selected=true]'
  }

  itemAt(index) {
    // nth-child is not zero-based
    index++
    return this.client.$(`[data-test-id=version-list] > [role=button]:nth-child(${index})`)
  }

  // Actions
  clickOnItem(index = 0) {
    // nth-of-type is not zero-based
    index++
    return this.client.$('[data-test-id=version-list]').$(`[role=button]:nth-of-type(${index})`).click()
  }

  // Events
  waitToLoad() {
    return this.client.waitUntilTextExists('h6', '61 versions available', 5000)
  }

  waitUntilVersionSelected(index = 0) {
    // nth-child is not zero-based
    index++
    return this.client.waitUntilTextExists(`[data-test-id=version-list] [role=button]:nth-child(${index}) span span`, 'SELECTED', 20000)
  }

  waitUntilVersionDownloading(index = 0) {
    // nth-child is not zero-based
    index++
    return this.client.waitUntilTextExists(`[data-test-id=version-list] [role=button]:nth-child(${index}) span span`, 'DOWNLOADING', 1000)
  }
}

export default VersionList
