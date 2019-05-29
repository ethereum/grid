import ApplicationFactory from './_ApplicationFactory'

let globalApp

beforeEach(async () => {
  globalApp = ApplicationFactory.development()

  await globalApp.start()
})

afterEach(async () => {
  await globalApp.stop()
})

test('sanity', async () => {
  const app = globalApp
  await app.client.waitUntilWindowLoaded()

  const win = app.browserWindow
  expect(await app.client.getWindowCount()).toBe(1)
  expect(await win.isMinimized()).toBeFalsy()
  expect(await win.isDevToolsOpened()).toBeFalsy()
  expect(await win.isVisible()).toBeTruthy()

  const {width, height} = await win.getBounds()
  expect(width).toBeGreaterThan(0)
  expect(height).toBeGreaterThan(0)
})
