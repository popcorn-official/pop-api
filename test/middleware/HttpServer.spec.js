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
  it('should check the attributes of the Server', () => {
    const stub = sinon.stub(cluster, 'fork')
    stub.returns(null)

    new HttpServer({}, { app }) // eslint-disable-line no-new

    stub.restore()
  })

  /** @test {HttpServer#constructor} */
  it('should check the attributes of the Server', () => {
    expect(httpServer._serverPort).to.exist
    expect(httpServer._serverPort).to.be.a('number')
    expect(httpServer._server).to.exist
    expect(httpServer._server).to.be.an('object')
    expect(httpServer._workers).to.exist
    expect(httpServer._workers).to.be.a('number')
  })

  /** @test {HttpServer#_forkWorkers} */
  it('should fork the workers', () => {
    const stub = sinon.stub(cluster, 'fork')
    stub.returns(null)

    httpServer._workers = 2
    httpServer._forkWorkers()

    httpServer._workers = 0
    stub.restore()
  })

  /** @test {HttpServer#_workersOnExit} */
  it('should handle the exit event of the workers', done => {
    const stub = sinon.stub(cluster, 'fork')
    stub.returns(null)

    httpServer._workersOnExit()

    cluster.emit('exit', {
      process: {
        pid: 1
      }
    })
    stub.restore()

    done()
  })

  /** @test {HttpServer#_setupApi} */
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

    httpServer._setupApi(app)

    httpStub.restore()
    stubMaster.restore()
  })

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
