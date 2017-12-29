// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import del from 'del'
import mkdirp from 'mkdirp'
import mongoose from 'mongoose'
import sinon from 'sinon'
import { expect } from 'chai'
import { join } from 'path'

import {
  Database,
  PopApi
} from '../../src'
import { name } from '../../package'

/** @test {Database} */
describe('Database', () => {
  /**
   * The stub for `process.env`.
   * @type {Object}
   */
  let stub: Object

  /**
   * The direcotry where the logs are saved.
   * @type {string}
   */
  let logDir: string

  /**
   * The database manager to connect to mongodb.
   * @type {Database}
   */
  let database: Database

  /**
   * Hook for setting up the Database tests.
   * @type {Function}
   */
  before(() => {
    const {
      MONGO_PORT_27017_TCP_ADDR,
      NODE_ENV,
      PATH
    } = process.env
    stub = sinon.stub(process, 'env')
    stub.value({
      MONGO_PORT_27017_TCP_ADDR,
      NODE_ENV,
      PATH
    })

    logDir = join(...[
      __dirname,
      '..',
      '..',
      'tmp'
    ])
    mkdirp.sync(logDir)

    database = new Database(PopApi, {
      database: name,
      username: '',
      password: ''
    })
  })

  /** @test {Database#constructor} */
  it('should test the use the environment variables to connect', () => {
    const stub = process.env.MONGO_PORT_27017_TCP_ADDR
    process.env.MONGO_PORT_27017_TCP_ADDR = 'localhost'
    new Database(PopApi, { // eslint-disable-line no-new
      database: name
    })

    process.env.MONGO_PORT_27017_TCP_ADDR = null
    new Database(PopApi, { // eslint-disable-line no-new
      database: name
    })
    process.env.MONGO_PORT_27017_TCP_ADDR = stub

    try {
      new Database(PopApi, {}) // eslint-disable-line no-new
      expect(true).to.be.false
    } catch (err) {
      expect(err).to.be.an('Error')
      expect(err.message).to.equal(
        '\'database\' is a required option for the Database middleware!'
      )
    }
  })

  /** @test {Database#constructor} */
  it('should check the attributes of the Database', () => {
    const temp = process.env.MONGO_PORT_27017_TCP_ADDR
    process.env.MONGO_PORT_27017_TCP_ADDR = null
    expect(database.hosts).to.exist
    expect(database.hosts).to.be.an('array')
    process.env.MONGO_PORT_27017_TCP_ADDR = temp

    expect(database.database).to.exist
    expect(database.database).to.be.a('string')
    expect(database.dbPort).to.exist
    expect(database.dbPort).to.be.a('number')
    expect(database.username).to.exist
    expect(database.username).to.be.a('string')
    expect(database.password).to.exist
    expect(database.password).to.be.a('string')
  })

  /** @test {Database#constructor} */
  it('should fail to create a new Database object', () => {
    process.env.NODE_ENV = null
    expect(mongoose.connection.readyState).to.be.a('number')
    expect(mongoose.connection.readyState).to.equal(0)

    try {
      new Database(PopApi, { // eslint-disable-line no-new
        database: name
      })
      process.env.NODE_ENV = 'test'
    } catch (err) {
      process.env.NODE_ENV = 'test'
      expect(err).to.be.an('Error')
    }
  })

  /**
   * Test the changing connection state.
   * @param {!Function} method - Method to change to connection state.
   * @param {!number} before - The connection state it is before executing the
   * method to change it.
   * @param {!number} after - The connection state it is after executing the
   * method to change it.
   * @param {Function} done - The method executed when the test is done.
   * @returns {undefined}
   */
  function testConnection(
    method: Function,
    before: number,
    after: number,
    done: Function
  ): void {
    expect(mongoose.connection.readyState).to.be.a('number')
    expect(mongoose.connection.readyState).to.equal(before)

    method().then(() => {
      expect(mongoose.connection.readyState).to.be.a('number')
      expect(mongoose.connection.readyState).to.equal(after)

      done()
    }).catch(done)
  }

  /** @test {Database#connect} */
  it('should connect to MongoDB', done => {
    testConnection(database.connect.bind(database), 0, 1, done)
  })

  /** @test {Database#disconnect} */
  it('should disconnect from MongoDB', done => {
    testConnection(database.disconnect.bind(database), 1, 0, done)
  })

  /** @test {Database#connect} */
  it('should fail to authenticate with MongoDB', done => {
    expect(mongoose.connection.readyState).to.be.a('number')
    expect(mongoose.connection.readyState).to.equal(0)

    const database = new Database(PopApi, {
      database: name,
      username: 'fault',
      password: 'faulty'
    })

    database.connect()
      .then(done)
      .catch(err => {
        expect(err.name).to.equal('MongoError')
        mongoose.connection.onClose(true)

        done()
      })
  })

  /** @test {Database#exportFile} */
  it('should export a file', done => {
    const collection = 'example'
    const outputFile = join(...[
      logDir,
      `${collection}s.json`
    ])

    database.exportFile(collection, outputFile).then(res => {
      expect(res).to.be.undefined
      done()
    }).catch(done)
  })

  /** @test {Database#importFile} */
  it('should import a file', done => {
    const file = './examples/exampleModel1.json'

    database.importFile('example', file).then(res => {
      expect(res).to.be.undefined
      done()
    }).catch(done)
  })

  /** @test {Database#importFile} */
  it('should not find the file to import', done => {
    database.importFile('example', '/data/example.json')
      .then(done)
      .catch(err => {
        expect(err).to.be.an('Error')
        done()
      })
  })

  /**
   * Hook for tearing down the Database tests.
   * @type {Function}
   */
  after(done => {
    stub.restore()
    database.disconnect()
      .then(() => del([logDir]))
      .then(() => done())
      .catch(done)
  })
})
