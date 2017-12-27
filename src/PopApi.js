// Import the necessary modules.
// @flow
import debug from 'debug'
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
import { name } from '../package.json'

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
   * The application instance for the PopApi framework.
   * @type {Express}
   */
  static app: $Application = express()

  /**
   * The debugger for extra  output.
   * @type {Function}
   */
  static debug: Function = debug(name)

  /**
   * A map of the installed plugins.
   * @type {Map<any>}
   */
  static _installedPlugins: Map<string, any> = new Map()

  /**
   * The setup for the base framework.
   * @param {!Object} options - The options for the framework.
   * @param {!Express} [options.app=PopApi.app] - The web framework instance you
   * want to use.
   * @param {!Array<Object>} options.controllers - The controllers to register.
   * @param {!string} options.name - The name for your API.
   * @param {!string} options.version - The version of your API.
   * @param {?string} options.logDir - The directory to store the log files in.
   * @param {?Array<string>} [options.hosts] - The hosts of
   * the database cluster.
   * @param {?number} [options.dbPort] - The port the database is on.
   * @param {?string} [options.username] - The username for the database
   * connection.
   * @param {?string} [options.password] - The password for the database
   * connection.
   * @param {?number} [options.serverPort] - The port the API will run on.
   * @param {?number} [options.workers] - The number of workers for the API.
   * @param {?Object} [options.opts] - Additionl options for custom
   * middlewares.
   * @param {!Array<Function>} middlewares - The list of middlewares to use.
   * The order of the middlewares is important.
   * @returns {Promise<PopApi, Error>} - The initialized PopApi instance.
   */
  static async init({
    app = PopApi.app,
    controllers,
    name,
    version,
    logDir = defaultLogDir,
    hosts,
    dbPort,
    username,
    password,
    serverPort,
    workers,
    ...opts
  }: Object, middlewares: Array<Function> = [
    Cli,
    Logger,
    Database,
    Routes,
    HttpServer
  ]): Promise<Object | Error> {
    PopApi.app = app
    if (isMaster) {
      await utils.createTemp(logDir)
    }

    middlewares.map(Middleware => {
      PopApi.use(Middleware, {
        app,
        controllers,
        name,
        version,
        logDir,
        database: name,
        hosts,
        dbPort,
        username,
        password,
        serverPort,
        workers,
        argv: process.argv,
        ...PopApi.loggerArgs,
        ...opts
      })
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
