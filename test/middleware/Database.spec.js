// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import del from 'del'
import mkdirp from 'mkdirp'
import mongoose from 'mongoose'
import sinon from 'sinon'
import { expect } from 'chai'
import { join } from 'path'

import { Database } from '../../src'
import { name } from '../../package'

/** @test {Database} */
describe('Database', () => {
  /**
   * The stub for `process.env`.
   * @type {Object}
   */
  let stub: Object

  /**
   * The path the to the temporary directory to test.
   * @type {string}
   */
  let tmp: string

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

    tmp = join(...[
      __dirname,
      '..',
      '..',
      'tmp'
    ])
    mkdirp.sync(tmp)

    database = new Database({}, {
      database: name
    })
  })

  /** @test {Database#constructor} */
  it('should test the use the environment variables to connect', () => {
    const stub = process.env.MONGO_PORT_27017_TCP_ADDR
    process.env.MONGO_PORT_27017_TCP_ADDR = 'localhost'
    new Database({}, { // eslint-disable-line no-new
      database: name
    })

    process.env.MONGO_PORT_27017_TCP_ADDR = null
    new Database({}, { // eslint-disable-line no-new
      database: name
    })
    process.env.MONGO_PORT_27017_TCP_ADDR = stub
  })

  /** @test {Database#constructor} */
  it('should check the attributes of the Database', () => {
    const temp = process.env.MONGO_PORT_27017_TCP_ADDR
    process.env.MONGO_PORT_27017_TCP_ADDR = null
    expect(database._hosts).to.exist
    expect(database._hosts).to.be.an('array')
    process.env.MONGO_PORT_27017_TCP_ADDR = temp

    expect(database._database).to.exist
    expect(database._database).to.be.a('string')
    expect(database._dbPort).to.exist
    expect(database._dbPort).to.be.a('number')
    expect(database._username).to.exist
    expect(database._username).to.be.a('string')
    expect(database._password).to.exist
    expect(database._password).to.be.a('string')
  })

  /** @test {Database#constructor} */
  it('should fail to create a new Database object', () => {
    process.env.NODE_ENV = null
    expect(mongoose.connection.readyState).to.be.a('number')
    expect(mongoose.connection.readyState).to.equal(0)

    try {
      new Database({}, { // eslint-disable-line no-new
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

    const database = new Database({}, {
      database: name,
      username: 'fault',
      password: 'faulty'
    })

    database.connect()
      .then(done)
      .catch(err => {
        expect(err).to.be.an('Error')
        done()
      })
  })

  /** @test {Database#exportCollection} */
  it('should export a collection', done => {
    const collection = 'example'
    const outputFile = join(...[
      tmp,
      `${collection}s.json`
    ])

    database.exportCollection(collection, outputFile).then(res => {
      expect(res).to.be.undefined
      done()
    }).catch(done)
  })

  /** @test {Database#importCollection} */
  it('should import a collection', done => {
    const file = './examples/exampleModel1.json'

    database.importCollection('example', file).then(res => {
      expect(res).to.be.undefined
      done()
    }).catch(done)
  })

  /** @test {Database#importCollection} */
  it('should not find the file to import', done => {
    database.importCollection('example', '/data/example.json')
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
    del.sync([tmp])
    stub.restore()

    database.disconnect()
      .then(() => done())
      .catch(done)
  })
})
