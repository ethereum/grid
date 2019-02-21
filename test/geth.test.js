const { assert } = require('chai')
const Geth = require('../ethereum_clients/geth')
const path = require('path')
const { AppManager } = require('@philipplgh/electron-app-manager')
const fs = require('fs')
const nock = require('nock');
const mockfs = require('mock-fs');
const os = require('os');



const walk = async (dir, filelist = []) => {
  console.log('dir', dir);
  const files = fs.readdirSync(dir);
    console.log('FILES', files);
  for (file of files) {
    const filepath = path.join(dir, file);
    const stat = await fs.lstat(filepath);
    console.log('STAT', stat, filepath);

    if (stat && stat.isDirectory()) {
      filelist = await walk(filepath, filelist);
    } else {
      filelist.push(file);
    }
  }

  return filelist;
}





afterEach(function() {
  mockfs.restore()
})

describe("Clients", function(){

describe("Geth.js", function() {
  const GETH_CACHE = path.join(__dirname, 'geth_bin')
  console.log('GETH_CACHE', GETH_CACHE);
  if(!fs.existsSync(GETH_CACHE)){
    fs.mkdirSync(GETH_CACHE)
  }

  //
  // const gethUpdater = new AppManager({
  //   repository: 'https://gethstore.blob.core.windows.net',
  //   modifiers: {
  //     version: ({ version })  => version.split('-').slice(0, -1).join('-')
  //   },
  //   filter: ({fileName}) => !fileName.includes('alltools') && (urlFilter && fileName.includes(urlFilter)),
  //   auto: false,
  //   paths: [],
  //   cacheDir: GETH_CACHE
  // })

  const scope = nock('https://gethstore.blob.core.windows.net', { allowUnmocked: false })
  .head('/builds?restype=container&comp=list').reply(200, 'ok')
  .persist()
  .get('/builds?restype=container&comp=list')
  .reply(200, fs.readFileSync(__dirname+'/fixtures/azureReleases.xml'))
  .persist()
  .head('/builds/geth-darwin-amd64-1.8.22-7fa3509e.tar.gz').reply(200, 'ok')
  .persist()
  // .get('/builds/geth-windows-386-1.8.22-7fa3509e.zip')
  // .reply(200, fs.readFileSync(__dirname+'/fixtures/BinCache/geth'))
  // .persist()
  .head('/builds/geth-windows-386-1.8.22-7fa3509e.zip.asc').reply(200, 'ok')
  .persist()
  .get('/builds/geth-darwin-amd64-1.8.22-7fa3509e.tar.gz.asc')
  .reply(200, fs.readFileSync(__dirname+'/fixtures/BinCache/geth-darwin-amd64-1.8.22-7fa3509e.tar.gz.asc'))
  .persist()


  const Fixtures = {
    gethObject: {
      checksums: {md5: "2c34a79a3327f58263893941c58b3282"},
      fileName: "geth-darwin-amd64-1.8.22-7fa3509e.tar.gz",
      location: path.resolve("ethereum_clients/geth_bin/geth-darwin-amd64-1.8.22-7fa3509e.tar.gz"),
      name: "geth-darwin-amd64-1.8.22-7fa3509e.tar",
      signature: "https://gethstore.blob.core.windows.net/builds/geth-darwin-amd64-1.8.22-7fa3509e.tar.gz.asc",
      size: "9981459",
      tag: "1.8.22-7fa3509e",
      version: "1.8.22",
    },
    geth: {
      v1_8_22: {
        targz_path: path.resolve('./ethereum_clients/geth_bin/geth-darwin-amd64-1.8.22-00000000.tar.gz'),
        binaryPath: path.resolve('./ethereum_clients/geth_bin/geth-darwin-amd64-1.8.22-7fa3509e/geth')
      }
    },
  }

  describe("init()", function() {

    xit("connects to a running instance", async function() {

    })

  })

  describe("extractPackageBinaries()", function() {
    const geth = new Geth()

    it("extracts from local .tar.gz package", async function() {
      const binaryPathDisk = await geth.extractPackageBinaries(Fixtures.gethObject)
      assert.equal(binaryPathDisk, Fixtures.geth.v1_8_22.binaryPath)
    })
  })

  describe("getLocalBinary()", function() {
    const geth = new Geth()

    it("does something", async function() {
      const cache = await geth.getLocalBinary()
      assert.equal(cache, '-')
    })
  })

  describe("getLocalBinaries()", function() {
    const geth = new Geth()

    xit("finds all local geth binaries", async function() {
      mockfs({
        ethereum_clients: {
          geth_bin: {
            'geth-darwin-amd64-1.8.22-7fa3509e': {
              geth: 'xxx'
            },
            'geth-darwin-amd64-1.8.21-7fa3509e': {
              geth: 'yyy'
            },
            'geth-darwin-amd64-1.8.20-7fa3509e': {
              geth: 'zzz'
            }
          }
        }
      })

      const GETH_CACHE = path.join(process.cwd(), 'geth_bin')
      console.log('GETH_CACHE', GETH_CACHE);

      if(!fs.existsSync(GETH_CACHE)){
        fs.mkdirSync(GETH_CACHE)
      }

      const gethUpdater = new AppManager({
        repository: 'https://gethstore.blob.core.windows.net',
        modifiers: {
          version: ({ version })  => version.split('-').slice(0, -1).join('-')
        },
        filter: ({fileName}) => !fileName.includes('alltools') && (urlFilter && fileName.includes(urlFilter)),
        auto: false,
        paths: [],
        cacheDir: GETH_CACHE
      })

      geth.getUpdater = () => gethUpdater

      const filelist = await walk(process.cwd())
      console.log('File list', filelist);

      let binaries = await geth.getLocalBinaries()
      assert.equal(binaries.length, 4)
    })

  })

  describe("getReleases()", function(){
    const geth = new Geth()

    it("loads geth release list from XML", async function() {
      const releases = await geth.getReleases()
      assert.isAbove(releases.length, 0)
    })

    it("loads information about geth releases", async function() {
      const releases = await geth.getReleases()
      assert.containsAllKeys(releases[0], [
        'channel',
        'checksums',
        'commit',
        'error',
        'fileName',
        'location',
        'name',
        'signature',
        'size',
        'tag',
        'version'
      ])
    })

    it("has stable versions", async function() {
      const allReleases = await geth.getReleases()
      const stableReleases = allReleases.filter(e => !/unstable/.test(e.fileName))
      assert.isAbove(stableReleases.length, 0)
      assert.isBelow(stableReleases.length, allReleases.length)
    })
  })

  describe("download()", function() {

    xit("does something", async function() {
    })

  })

  describe("start()", function() {

    xit("does something", async function() {
    })

  })

  describe("stop()", function() {

    xit("does something", async function() {
    })

  })

  describe("restart()", function() {

    xit("does something", async function() {
    })

  })

  describe("getStatus()", function(){
    xit("does something", async function() {

    })
  })

  describe("x", function(){
    xit("does something", async function() {

    })
  })

})

})
