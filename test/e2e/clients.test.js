import test from 'ava'
import ApplicationFactory from './_ApplicationFactory'
import ClientAppBar from './_ClientAppBar'
import MainAppBar from './_MainAppBar'
import VersionList from './_VersionList'
import { rmGethDir, clearBinDir } from './_TestUtils'
import Node from './_Node'
import ClientSettingsForm from './_ClientSettingsForm'
import {getProcess, getProcessFlags} from './_ProcessMatcher'

const init = async function(t) {
  const app = t.context.app
  await app.client.waitUntilWindowLoaded(20000)
  const win = app.browserWindow
  const client = app.client
  return { app, win, client }
}

test.beforeEach(async t => {
  // rmGethDir()
  clearBinDir()

  t.context.app = ApplicationFactory.development()

  await t.context.app.start()
})

test.afterEach.always(async t => {
  await t.context.app.stop()
})

test('Parity config to flags', async t => {
  const {app, client, win} = await init(t)
  const versionList = new VersionList(app.client)
  const node = new Node(app.client)
  const clientAppBar = new ClientAppBar(app.client)
  const settings = new ClientSettingsForm(app.client)

  await versionList.waitToLoad()

  await node.select('parity')

  await versionList.waitToLoad()
  await versionList.clickOnItem(0)
  await versionList.waitUntilVersionSelected(0)

  await clientAppBar.settings.click()

  const defaultIpcPathValue = await settings.getPathInput('ipcPath').getValue()

  await node.toggle('parity')
  await node.waitUntilStarted()

  const parityFlags = await getProcessFlags('parity')
  const gf = parityFlags.join(' ')

  t.true(gf.includes(`--ipc-path ${defaultIpcPathValue}`));
})
