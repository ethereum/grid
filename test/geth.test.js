const { assert } = require('chai')
const Geth = require('../ethereum_clients/geth')

describe("Clients", function(){

describe("Geth.js", function() {

  describe("init()", function() {

    it("connects to a running instance", async function() {

    })

  })

  describe("extractPackageBinaries()", function() {

    it("does something", async function() {
    })

  })

  describe("getLocalBinary()", function() {

    it("does something", async function() {
    })

  })

  describe("getLocalBinaries()", function() {

    it("finds all local geth binaries", async function() {
      const geth = new Geth()
      let binaries = await geth.getLocalBinaries()
      assert.equal(binaries.length, 4)
    })

  })

  describe("getReleases()", function(){
    it("finds all hosted geth releases", async function() {
    })
  })

  describe("download()", function() {

    it("does something", async function() {
    })

  })

  describe("start()", function() {

    it("does something", async function() {
    })

  })

  describe("stop()", function() {

    it("does something", async function() {
    })

  })

  describe("restart()", function() {

    it("does something", async function() {
    })

  })

  describe("getStatus()", function(){
    it("does something", async function() {

    })
  })

  describe("x", function(){
    it("does something", async function() {

    })
  })

})

})
