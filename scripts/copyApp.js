
// TODO executed before electron builder builds: copies or downloads with app-updater a version of the latest .asar to this dir for shipping
// TODO make sure there is not more than one asar present

const path = require('path');
const {AppUpdater} = require('@philipplgh/electron-app-updater');

const updater = new AppUpdater({
  repo: 'https://github.com/PhilippLgh/mist-ui-react'
});

(async function(){
  const latest = await updater.getLatest()
  await updater.download(latest, true, path.join(__dirname, '..'));
})();
