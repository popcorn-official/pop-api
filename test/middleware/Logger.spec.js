// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import del from 'del'
import mkdirp from 'mkdirp'
import sinon from 'sinon'
import { expect } from 'chai'
import { join } from 'path'

import { Logger } from '../../src'
import { name } from '../../package'

/** @test {Logger} */
describe('Logger', () => {
  /**
   * The logger instance to test.
   * @type {Logger}
   */
  let logger: Logger

  /**
   * The directory where the logs are saved.
   * @type {string}
   */
  let logDir: string

  /**
   * Hook for setting up the Logger tests.
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

    logger = new Logger({}, {
      name,
      logDir,
      type: 'winston',
      pretty: false,
      quiet: true
    })
  })

  /** @test {Logger#constructor} */
  it('should create an ExpressWinston instance', () => {
    const stub = sinon.stub(process.env, 'NODE_ENV')
    stub.value('development')

    const logger = new Logger({}, {
      name,
      logDir,
      type: 'express',
      pretty: true,
      quiet: false
    })
    expect(logger).to.be.an('object')

    stub.restore()
  })

  /** @test {Logger#constructor} */
  it('should check the attributes of the Logger', () => {
    expect(logger._levels).to.exist
    expect(logger._levels).to.be.an('object')
    expect(logger._name).to.exist
    expect(logger._name).to.be.a('string')
    expect(logger._logDir).to.exist
    expect(logger._logDir).to.be.a('string')
  })

  /** @test {Logger#_checkEmptyMessage} */
  it('should check for an empty message with a full message', () => {
    const empty = {
      message: '',
      meta: {
        message: 'test'
      }
    }
    const emptyResult = logger._checkEmptyMessage(empty)
    expect(emptyResult.message).to.exist
    expect(emptyResult.message).to.equal(JSON.stringify(empty.meta))
    expect(emptyResult.meta).to.exist
    expect(emptyResult.meta).to.deep.equal({
      message: 'test'
    })
  })

  /** @test {Logger#_checkEmptyMessage} */
  it('should check for an empty message with an empty message', () => {
    const full = {
      message: 'test',
      meta: {}
    }
    const fullResult = logger._checkEmptyMessage(full)
    expect(fullResult.message).to.exist
    expect(fullResult.message).to.equal('test')
    expect(fullResult.meta).to.exist
    expect(fullResult.meta).to.deep.equal({})
  })

  /** @test {Logger#_getLevelColor} */
  it('should test if the correct logger colors are returned', () => {
    const error = logger._getLevelColor('error')
    expect(error).to.equal('\x1b[31m')
    const warn = logger._getLevelColor('warn')
    expect(warn).to.equal('\x1b[33m')
    const info = logger._getLevelColor('info')
    expect(info).to.equal('\x1b[36m')
    const debug = logger._getLevelColor('debug')
    expect(debug).to.equal('\x1b[34m')
    const nothing = logger._getLevelColor(undefined)
    expect(nothing).to.equal('\x1b[36m')
  })

  /** @test {Logger#_consoleFormatter} */
  it('should make an object into a string for the console formatter', () => {
    expect(logger._consoleFormatter({
      level: 'info'
    })).to.be.a('string')
  })

  /** @test {Logger#_fileFormatter} */
  it('should make an object into a string for the file formatter', () => {
    expect(logger._fileFormatter({})).to.be.a('string')
  })

  /** @test {Logger#_getConsoleTransport} */
  it('should get a configured winston console transport', () => {
    const transport = logger._getConsoleTransport()
    expect(transport).to.be.an('object')
  })

  /** @test {Logger#_getFileTransport} */
  it('should get a configured winston file transport', () => {
    const transport = logger._getFileTransport('winston')
    expect(transport).to.be.an('object')
  })

  /** @test {Logger#_createWinston} */
  it('should create a configured winston instance', () => {
    const logy = logger._createWinston()
    expect(logy).to.be.an('object')
  })

  /** @test {Logger#_createWinston} */
  it('should create a configured winston instance', () => {
    const stub = process.env.TEMP_DIR
    process.env.TEMP_DIR = null

    const logy = logger._createWinston()
    expect(logy).to.be.an('object')

    process.env.TEMP_DIR = stub
  })

  /** @test {Logger#_createExpressWinston} */
  it('should create a configured ExpressWinston instance', () => {
    const logy = logger._createExpressWinston()
    expect(logy).to.be.a('function')
  })

  /** @test {Logger#_createExpressWinston} */
  it('should create a configured ExpressWinston instance with developer output', () => {
    const stub = sinon.stub(process.env, 'NODE_ENV')
    stub.value('development')

    const logy = logger._createExpressWinston()
    expect(logy).to.be.a('function')

    stub.restore()
  })

  /** @test {Logger#_createLogger} */
  it('should create the global logger object', () => {
    let val = logger._createLogger(true, true)
    expect(val).to.be.an('object')

    val = logger._createLogger(false, false)
    expect(val).to.be.an('object')

    val = logger._createLogger(false, true)
    expect(val).to.be.an('object')
  })

  /** @test {Logger#_getLogger} */
  it('should not create an instance of ExpressWinston or Winston', () => {
    expect(logger._getLogger()).to.be.undefined
    expect(logger._getLogger('FAULTY')).to.be.undefined
  })

  /**
   * Hook for tearing down the Logger tests.
   * @type {Function}
   */
  after(() => {
    del.sync([logDir])
  })
})
