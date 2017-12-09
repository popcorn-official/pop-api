// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import cluster from 'cluster'
import del from 'del'
import express, { type $Application } from 'express'
import http from 'http'
import mkdirp from 'mkdirp'
import sinon from 'sinon'
import { expect } from 'chai'
import { join } from 'path'

import {
  Database,
  Logger,
  HttpServer
} from '../../src'
import { name } from '../../package'

/** @test {HttpServer} */
describe('HttpServer', () => {
  /**
   * The Express instance to test with.
   * @type {Express}
   */
  let app: $Application

  /**
   * The http server instance to test.
   * @type {HttpServer}
   */
  let httpServer: HttpServer

  /**
   * The directory where the logs are saved.
   * @type {string}
   */
  let logDir: string

  /**
   * Hook for setting up the HttpServer tests.
   * @type {Function}
   */
  before(() => {
    logDir = join(...[
      __dirname,
      '..',
      '..',
      'tmp'
    ])
    mkdirp.sync(logDir)
    new Logger({}, { // eslint-disable-line no-new
      name,
      logDir,
      type: 'winston',
      pretty: false,
      quiet: true
    })

    app = express()
    httpServer = new HttpServer({}, {
      app,
      workers: 0
    })
  })

  /** @test {HttpServer#constructor} */
  it('should create a HttpServer with an Express instance', () => {
    const stub = sinon.stub(cluster, 'fork')
    stub.returns(null)

    const httpServer = new HttpServer({}, {
      app: express()
    })
    httpServer.closeApi({
      disconnect() {}
    })

    stub.restore()
  })

  /** @test {HttpServer#constructor} */
  it('should create a HttpServer with a Restify instance', () => {
    const stub = sinon.stub(cluster, 'fork')
    stub.returns(null)

    const httpServer = new HttpServer({}, {
      app: http.createServer(() => {})
    })
    httpServer.closeApi({
      disconnect() {}
    })

    stub.restore()
  })

  /** @test {HttpServer#constructor} */
  it('should check the attributes of the HttpServer', () => {
    expect(httpServer.serverPort).to.exist
    expect(httpServer.serverPort).to.be.a('number')
    expect(httpServer.server).to.exist
    expect(httpServer.server).to.be.an('object')
    expect(httpServer.workers).to.exist
    expect(httpServer.workers).to.be.a('number')
  })

  /** @test {HttpServer#forkWorkers} */
  it('should fork the workers', () => {
    const stub = sinon.stub(cluster, 'fork')
    stub.returns(null)

    httpServer.workers = 2
    httpServer.forkWorkers()

    httpServer.workers = 0
    stub.restore()
  })

  /** @test {HttpServer#workersOnExit} */
  it('should handle the exit event of the workers', done => {
    const stub = sinon.stub(cluster, 'fork')
    stub.returns(null)

    httpServer.workersOnExit()

    cluster.emit('exit', {
      process: {
        pid: 1
      }
    })
    stub.restore()

    done()
  })

  /**
   * Helper function to test the '_setupApi' method.
   * @param {!number} workers - The amount of workers to use.
   * @returns {undefined}
   */
  function testSetupApi(workers): void {
    /** @test {HttpServer#setupApi} */
    it('should start the API in worker mode', () => {
      const httpStub = sinon.stub(http, 'createServer')
      const listen = {
        listen() {
          return null
        }
      }
      httpStub.returns(listen)

      const stubMaster = sinon.stub(cluster, 'isMaster')
      stubMaster.value(false)

      const httpServer = new HttpServer({}, {
        workers,
        app: express()
      })
      httpServer.setupApi(app)

      httpStub.restore()
      stubMaster.restore()
    })
  }

  // Execute the tests.
  [0, 1].map(testSetupApi)

  /** @test {HttpServer.closeApi} */
  it('should close the API', done => {
    const database = new Database({}, {
      database: name
    })

    httpServer.closeApi(database)
    httpServer.closeApi(database, done)
  })

  /**
   * Hook for tearing down the HttpServer tests.
   * @type {Function}
   */
  after(() => {
    del.sync([logDir])
  })
})
