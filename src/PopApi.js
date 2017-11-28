// Import the necessary modules.
// @flow
/**
 * Fast, unopinionated, minimalist web framework for node.
 * @external {Express} https://github.com/expressjs/express
 */
import express, { type $Application } from 'express'
import { isMaster } from 'cluster'
import { join } from 'path'

import {
  Cli,
  Database,
  HttpServer,
  Logger,
  Routes
} from './middleware'
import * as utils from './utils'

/**
 * The default log directory.
 * @type {string}
 */
const defaultLogDir = join(...[
  __dirname,
  '..',
  'tmp'
])

/**
 * The PopApi class with the middleware pattern.
 * @type {PopApi}
 */
export default class PopApi {

  /**
   * The Express instance for the PopApi framework.
   * @type {Express}
   */
  static app: $Application = express()

  /**
   * A map of the installed plugins.
   * @type {Map<any>}
   */
  static _installedPlugins: Map<string, any> = new Map()

  /**
   * The database connection.
   * @type {Database}
   */
  static database: Database

  /**
   * The arguments passed down to the logger middleware.
   * @type {Object}
   */
  static loggerArgs: Object

  /**
   * The setup for the base framework.
   * @param {!Object} options - The options for the framework.
   * @param {!Array<Object>} options.controllers - The controllers to register.
   * @param {!string} options.name - The name for your API.
   * @param {!string} options.version - The version of your API.
   * @param {?string} options.logDir - The directory to store the log files in.
   * @param {?Array<string>} [options.hosts=['localhost']] - The hosts of
   * the database cluster.
   * @param {?number} [options.dbPort=27017] - The port the database is on.
   * @param {?string} [options.username] - The username for the database
   * connection.
   * @param {?string} [options.password] - The password for the database
   * connection.
   * @param {?number} [options.serverPort] - The port the API will run on.
   * @param {?number} [options.workers=2] - The number of workers for the API.
   * @returns {Promise<PopApi, Error>} - The initialized PopApi instance.
   */
  static async init({
    controllers,
    name,
    version,
    logDir = defaultLogDir,
    hosts = ['localhost'],
    dbPort = 27017,
    username,
    password,
    serverPort = process.env.PORT,
    workers = 2
  }: Object): Promise<Object | Error> {
    const { app } = PopApi
    if (isMaster) {
      await utils.createTemp(logDir)
    }

    PopApi.use(Cli, {
      argv: process.argv,
      name,
      version
    })

    const loggerOpts = {
      name,
      logDir,
      ...PopApi.loggerArgs
    }
    PopApi.use(Logger, loggerOpts)
    PopApi.use(Database, {
      database: name,
      hosts,
      username,
      password,
      dbPort
    })
    PopApi.use(HttpServer, {
      app,
      workers,
      serverPort
    })
    PopApi.use(Routes, {
      app,
      controllers
    })

    await PopApi.database.connect()

    return PopApi
  }

  /**
   * Register middleware for the PopApi framework.
   * @param {!Function} Plugin - The plugin to use.
   * @param {!Object} args - The arguments passed down to the constructor of
   * the plugin.
   * @returns {Promise<PopApi>} - The PopApi instance with the installed
   * plugins.
   */
  static use(Plugin: any, ...args: any): any {
    if (PopApi._installedPlugins.has(Plugin)) {
      return this
    }

    const plugin = typeof Plugin === 'function'
      ? new Plugin(this, ...args)
      : null

    if (plugin) {
      PopApi._installedPlugins.set(Plugin, plugin)
    }

    return this
  }

}
