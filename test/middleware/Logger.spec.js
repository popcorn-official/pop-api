// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import del from 'del'
import mkdirp from 'mkdirp'
import sinon from 'sinon'
import winston from 'winston'
import { expect } from 'chai'
import { join } from 'path'

import {
  Logger,
  PopApi
} from '../../src'
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

    logger = new Logger(PopApi, {
      name,
      logDir,
      pretty: false
    })
  })

  /** @test {Logger#constructor} */
  it('should create an ExpressWinston instance', () => {
    const processStub = sinon.stub(process.env, 'NODE_ENV')
    processStub.value('development')

    const logger = new Logger(PopApi, {
      name,
      logDir,
      pretty: true
    })
    expect(logger).to.be.an('object')

    try {
      new Logger(PopApi, {}) // eslint-disable-line no-new
      expect(true).to.be.false
    } catch (err) {
      expect(err).to.be.an('Error')
      expect(err.message).to.equal(
        '\'name\' and \'logDir\' are required options for the Logger middleware!'
      )
    }

    processStub.restore()
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

  /** @test {Logger#prettyPrintConsole} */
  it('should enrich the info object to pretty print the console', () => {
    let info = {
      level: 'info',
      message: 'This is a test message'
    }
    info = logger.prettyPrintConsole().transform(info)

    expect(info.level).to.be.a('string')
    expect(info.message).to.be.a('string')
    expect(info.splat).to.be.an('array')
  })

  /** @test {Logger#_getMessage} */
  it('should get the message string from the info object', () => {
    expect(logger._getMessage().transform({
      level: 'info',
      message: 'This is a test message'
    })).to.be.a('string')
  })

  /** @test {Logger#_enrichFileFormat} */
  it('should get the info from the info object', () => {
    expect(logger._enrichFileFormat().transform({
      level: 'info',
      message: 'This is a test message'
    })).to.be.an('object')
  })

  /** @test {Logger#consoleFormatter} */
  it('should make the console formatter', () => {
    expect(logger.consoleFormatter()).to.be.an('object')
  })

  /** @test {Logger#fileFormatter} */
  it('should make the file formatter', () => {
    expect(logger.fileFormatter()).to.be.an('object')
  })

  /** @test {Logger#getConsoleTransport} */
  it('should get a configured winston console transport', () => {
    const transport = logger.getConsoleTransport()
    expect(transport).to.be.an('object')
  })

  /** @test {Logger#getFileTransport} */
  it('should get a configured winston file transport', () => {
    const transport = logger.getFileTransport(`${name}-app`)
    expect(transport).to.be.an('object')
    transport.close()
  })

  /** @test {Logger#createLoggerInstance} */
  it('should create a configured winston instance', () => {
    const logy = logger.createLoggerInstance('app')
    expect(logy).to.be.an('object')
  })

  /** @test {Logger#createLoggerInstance} */
  it('should create a configured winston instance', () => {
    const stub = process.env.TEMP_DIR
    process.env.TEMP_DIR = null

    const logy = logger.createLoggerInstance('app')
    expect(logy).to.be.an('object')

    process.env.TEMP_DIR = stub
  })

  /** @test {Logger#getHttpLoggerMessage} */
  it('should get the message to print for express-winston', () => {
    const message = logger.getHttpLoggerMessage({
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

  /** @test {Logger#getLogger} */
  it('should not create an instance of Winston', () => {
    expect(logger.getLogger('logger')).to.be.an('object')
  })

  /** @test {Logger#getLogger} */
  it('should create an instance of ExpressWinston', () => {
    expect(logger.getLogger('http')).to.be.a('function')
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
  after(done => {
    winston.loggers.close()
    del([logDir])
      .then(() => done())
      .catch(done)
  })
})
