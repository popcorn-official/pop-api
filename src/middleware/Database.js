// Import the necessary modules.
// @flow
import mongoose from 'mongoose'
import { existsSync } from 'fs'
import {
  isAbsolute,
  join
} from 'path'

import { executeCommand } from '../utils'

/**
 * Class for setting up MongoDB.
 * @type {Database}
 */
export default class Database {

  /**
   * The name of the database. Default is the package name with the
   * environment mode.
   * @type {string}
   */
  _database: string

  /**
   * The host of the server of the database. Default is `['localhost']`.
   * @type {Array<string>}
   */
  _hosts: Array<string>

  /**
   * The port of the database. Default is `27017`.
   * @type {string}
   */
  _dbPort: number

  /**
   * The username of the database. DBy default this is left empty.
   * @type {string}
   */
  _username: string

  /**
   * The password of the database. By default this is left empty.
   * @type {string}
   */
  _password: string

  /**
   * Create a new Database object.
   * @param {!PopApi} PopApi - The PopApi instance to bind the database to.
   * @param {!Object} options - The options for the database.
   * @param {!string} options.database - The arguments to be parsed by
   * @param {!Array<string>} [options.hosts=['localhost']] - The hosts for the
   * MongoDb connection.
   * @param {!number} [options.dbPort=27017] - The port for the MongoDb
   * connection.
   * @param {?string} [options.username=''] - The username for the MongoDB
   * connection.
   * @param {?string} [options.password=''] - The password for the MongoDb
   * connection.
   */
  constructor(PopApi: any, {
    database,
    hosts = ['localhost'],
    dbPort = 27017,
    username = '',
    password = ''
  }: Object): void {
    process.env.NODE_ENV = process.env.NODE_ENV || ''

    const {
      MONGO_PORT_27017_TCP_ADDR,
      MONGO_PORT_27017_TCP_PORT,
      NODE_ENV
    } = process.env

    this._database = `${database}-${NODE_ENV}`
    this._hosts = MONGO_PORT_27017_TCP_ADDR
      ? [MONGO_PORT_27017_TCP_ADDR]
      : hosts
    this._dbPort = Number(MONGO_PORT_27017_TCP_PORT) || dbPort
    this._username = username
    this._password = password

    PopApi.database = this
  }

  /**
   * Connection and configuration of the MongoDB database.
   * @returns {Promise<undefined, Error>} - The promise to connect to MongoDB.
   */
  connect(): Promise<void> {
    let uri = 'mongodb://'
    if (this._username && this._password) {
      uri += `${this._username}:${this._password}@`
    }
    uri += `${this._hosts.join(',')}:${this._dbPort}/${this._database}`

    mongoose.Promise = global.Promise
    return mongoose.connect(uri, {
      useMongoClient: true
    }).catch(err => Promise.reject(new Error(err)))
  }

  /**
   * Disconnect from the MongoDB database.
   * @returns {Promise<undefined, Error>} - The promise to disconnect from
   * MongoDB.
   */
  disconnect(): Promise<void> {
    return mongoose.connection.close()
  }

  /**
   * Export a JSON file collection.
   * @param {!string} collection - The collection to export.
   * @param {!string} outputFile - The path of the output file of the export.
   * @returns {Promise<string, undefined>} - The promise to export a
   * collection.
   */
  exportCollection(
    collection: string,
    outputFile: string
  ): Promise<string | void> {
    const args = [
      '-d', this._database,
      '-c', `${collection}s`,
      '-o', outputFile
    ]
    return executeCommand('mongoexport', args)
  }

  /**
   * Import a JSON file collection.
   * @param {!string} collection - The collection to import.
   * @param {!string} jsonFile - The JSON file to import.
   * @returns {Promise<string, undefined>} - The promise to import a
   * collection.
   */
  importCollection(
    collection: string,
    jsonFile: string
  ): Promise<string | void> {
    const file = isAbsolute(jsonFile)
      ? jsonFile
      : join(...[__dirname, '..', '..', jsonFile])

    if (!existsSync(file)) {
      const err = new Error(`no such file found for '${file}'`)
      return Promise.reject(err)
    }

    const args = [
      '-d', this._database,
      '-c', `${collection}s`,
      '--file', jsonFile,
      '--upsert'
    ]
    return executeCommand('mongoimport', args)
  }

}
