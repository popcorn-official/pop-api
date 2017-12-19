// Import the necessary modules.
// @flow
import mongoose from 'mongoose'
import { existsSync } from 'fs'
import {
  isAbsolute,
  join
} from 'path'
import { URL } from 'url'

import { executeCommand } from '../utils'

/**
 * Class for setting up a database connection.
 * @type {Database}
 */
export default class Database {

  /**
   * The name of the database. Default is the package name with the
   * environment mode.
   * @type {string}
   */
  database: string

  /**
   * The host of the server of the database. Default is `['localhost']`.
   * @type {Array<string>}
   */
  hosts: Array<string>

  /**
   * The port of the database. Default is `27017`.
   * @type {string}
   */
  dbPort: number

  /**
   * The username of the database. By default this is left empty.
   * @type {string}
   */
  username: string

  /**
   * The password of the database. By default this is left empty.
   * @type {string}
   */
  password: string

  /**
   * Create a new Database object.
   * @param {!PopApi} PopApi - The PopApi instance to bind the database to.
   * @param {!Object} options - The options for the database.
   * @param {!string} options.database - The arguments to be parsed by
   * @param {!Array<string>} [options.hosts=['localhost']] - The hosts for the
   * database connection.
   * @param {!number} [options.dbPort=27017] - The port for the database
   * connection.
   * @param {?string} [options.username] - The username for the database
   * connection.
   * @param {?string} [options.password] - The password for the database
   * connection.
   * @throws {TypeError} - 'database' is a required option for the Database
   * middleware!
   */
  constructor(PopApi: any, {
    database,
    hosts = ['localhost'],
    dbPort = 27017,
    username,
    password
  }: Object): void {
    if (!database) {
      throw new TypeError('\'database\' is a required option for the Database middleware!')
    }

    process.env.NODE_ENV = process.env.NODE_ENV || 'development'

    const {
      MONGO_PORT_27017_TCP_ADDR,
      MONGO_PORT_27017_TCP_PORT,
      NODE_ENV
    } = process.env

    this.database = `${database}-${NODE_ENV}`
    this.hosts = MONGO_PORT_27017_TCP_ADDR
      ? [MONGO_PORT_27017_TCP_ADDR]
      : hosts
    this.dbPort = Number(MONGO_PORT_27017_TCP_PORT) || dbPort
    this.username = username || ''
    this.password = password || ''

    PopApi.database = this
  }

  /**
   * Connection and configuration of the database.
   * @returns {Promise<undefined, Error>} - The promise to connect to the
   * database.
   */
  connect(): Promise<void> {
    const uri = new URL(`mongodb://${this.username}:${this.password}@${this.hosts.join(',')}:${this.dbPort}/${this.database}`)

    mongoose.Promise = Promise
    return mongoose.connect(uri.href, {
      useMongoClient: true
    }).catch(err => Promise.reject(new Error(err)))
  }

  /**
   * Disconnect from the database.
   * @returns {Promise<undefined, Error>} - The promise to disconnect from
   * the database.
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
    return executeCommand('mongoexport', [
      '-d', this.database,
      '-c', `${collection}s`,
      '-o', outputFile
    ])
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
    const file = !isAbsolute(jsonFile)
      ? jsonFile
      : join(...[__dirname, '..', '..', jsonFile])

    if (!existsSync(file)) {
      const err = new Error(`no such file found for '${file}'`)
      return Promise.reject(err)
    }

    return executeCommand('mongoimport', [
      '-d', this.database,
      '-c', `${collection}s`,
      '--file', jsonFile,
      '--upsert'
    ])
  }

}
