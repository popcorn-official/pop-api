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
    expect(logger.levels).to.exist
    expect(logger.levels).to.be.an('object')
    expect(logger.name).to.exist
    expect(logger.name).to.be.a('string')
    expect(logger.logDir).to.exist
    expect(logger.logDir).to.be.a('string')
  })

  /** @test {Logger#checkEmptyMessage} */
  it('should check for an empty message with a full message', () => {
    const empty = {
      message: '',
      meta: {
        message: 'test'
      }
    }
    const emptyResult = logger.checkEmptyMessage(empty)
    expect(emptyResult.message).to.exist
    expect(emptyResult.message).to.equal(JSON.stringify(empty.meta))
    expect(emptyResult.meta).to.exist
    expect(emptyResult.meta).to.deep.equal({
      message: 'test'
    })
  })

  /** @test {Logger#checkEmptyMessage} */
  it('should check for an empty message with an empty message', () => {
    const full = {
      message: 'test',
      meta: {}
    }
    const fullResult = logger.checkEmptyMessage(full)
    expect(fullResult.message).to.exist
    expect(fullResult.message).to.equal('test')
    expect(fullResult.meta).to.exist
    expect(fullResult.meta).to.deep.equal({})
  })

  /** @test {Logger#getLevelColor} */
  it('should test if the correct logger colors are returned', () => {
    const error = logger.getLevelColor('error')
    expect(error).to.equal('\x1b[31m')
    const warn = logger.getLevelColor('warn')
    expect(warn).to.equal('\x1b[33m')
    const info = logger.getLevelColor('info')
    expect(info).to.equal('\x1b[36m')
    const debug = logger.getLevelColor('debug')
    expect(debug).to.equal('\x1b[34m')
    const nothing = logger.getLevelColor(undefined)
    expect(nothing).to.equal('\x1b[36m')
  })

  /** @test {Logger#consoleFormatter} */
  it('should make an object into a string for the console formatter', () => {
    expect(logger.consoleFormatter({
      level: 'info'
    })).to.be.a('string')
  })

  /** @test {Logger#fileFormatter} */
  it('should make an object into a string for the file formatter', () => {
    expect(logger.fileFormatter({})).to.be.a('string')
  })

  /** @test {Logger#getConsoleTransport} */
  it('should get a configured winston console transport', () => {
    const transport = logger.getConsoleTransport()
    expect(transport).to.be.an('object')
  })

  /** @test {Logger#getFileTransport} */
  it('should get a configured winston file transport', () => {
    const transport = logger.getFileTransport('winston')
    expect(transport).to.be.an('object')
  })

  /** @test {Logger#createLoggerInstance} */
  it('should create a configured winston instance', () => {
    const logy = logger.createLoggerInstance()
    expect(logy).to.be.an('object')
  })

  /** @test {Logger#createLoggerInstance} */
  it('should create a configured winston instance', () => {
    const stub = process.env.TEMP_DIR
    process.env.TEMP_DIR = null

    const logy = logger.createLoggerInstance()
    expect(logy).to.be.an('object')

    process.env.TEMP_DIR = stub
  })
  /** @test {Logger#_getHttpLoggerMessage} */
  it('should get the message to print for express-winston', () => {
    const message = logger._getHttpLoggerMessage({
      method: 'GET',
      url: 'http://mock.us'
    }, {
      statusCode: 418,
      responseTime: 420
    })
    expect(message).to.be.a('string')
})

  /** @test {Logger#createHttpLogger} */
  it('should create a configured Http logger instance', () => {
    const logy = logger.createHttpLogger()
    expect(logy).to.be.a('function')
  })

  /** @test {Logger#createHttpLogger} */
  it('should create a configured Http logger instance with developer output', () => {
    const stub = sinon.stub(process.env, 'NODE_ENV')
    stub.value('development')

    const logy = logger.createHttpLogger()
    expect(logy).to.be.a('function')

    stub.restore()
  })

  /** @test {Logger#createLogger} */
  it('should create the global logger object', () => {
    let val = logger.createLogger(true, true)
    expect(val).to.be.an('object')

    val = logger.createLogger(false, false)
    expect(val).to.be.an('object')

    val = logger.createLogger(false, true)
    expect(val).to.be.an('object')
  })

  /** @test {Logger#getLogger} */
  it('should not create an instance of ExpressWinston or Winston', () => {
    expect(logger.getLogger()).to.be.undefined
    expect(logger.getLogger('FAULTY')).to.be.undefined
  })

  /**
   * Hook for tearing down the Logger tests.
   * @type {Function}
   */
  after(() => {
    del.sync([logDir])
  })
})
