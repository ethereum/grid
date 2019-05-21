import test from 'ava';
import ApplicationFactory from './_ApplicationFactory'

test.beforeEach(async t => {
  t.context.app = ApplicationFactory.development()

  await t.context.app.start();
});

test.afterEach.always(async t => {
  await t.context.app.stop();
});

test('sanity', async t => {
  const app = t.context.app;
  await app.client.waitUntilWindowLoaded();

  const win = app.browserWindow;
  t.is(await app.client.getWindowCount(), 2);
  t.false(await win.isMinimized());
  t.false(await win.isDevToolsOpened());
  t.true(await win.isVisible());

  const {width, height} = await win.getBounds();
  t.true(width > 0);
  t.true(height > 0);
});
