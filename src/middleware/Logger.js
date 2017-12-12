// Import the necessary modules.
// @flow
import { join } from 'path'
/**
 * express.js middleware for winstonjs
 * @external {ExpressWinston} https://github.com/bithavoc/express-winston
 */
import {
  logger as httpLogger,
  requestWhitelist,
  responseWhitelist
} from 'express-winston'
import { sprintf } from 'sprintf-js'
import type { Middleware } from 'express'
/**
 * a multi-transport async logging library for node.js
 * @external {Winston} https://github.com/winstonjs/winston
 */
import {
  type createLogger as Winston,
  loggers,
  format,
  transports
} from 'winston'

/**
 * Class for setting up the logger.
 * @type {Logger}
 */
export default class Logger {

  /**
   * The file transport for the logger.
   * @type {Object}
   */
  static fileTransport: Object

  /**
   * The log levels the logger middleware will be using.
   * @type {Object}
   */
  levels: Object

  /**
   * The name of the log file.
   * @type {string}
   */
  name: string

  /**
   * The directory where the log file will be stored.
   * @type {string}
   */
  logDir: string

  /**
   * Create a new Logger object.
   * @param {!PopApi} PopApi - The PopApi instance to bind the logger to.
   * @param {!Object} options - The options for the logger.
   * @param {!string} options.name - The name of the log file.
   * @param {?boolean} [options.pretty] - Pretty mode for output with colors.
   * @param {?boolean} [options.quiet] - No output.
   */
  constructor(PopApi: any, {name, logDir, pretty, quiet}: Object): void {
    /**
     * The log levels the logger middleware will be using.
     * @type {Object}
     */
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    }
    /**
     * The name of the log file.
     * @type {string}
     */
    this.name = name
    /**
     * The directory where the log file will be stored.
     * @type {string}
     */
    this.logDir = logDir

    global.logger = this.getLogger('logger', pretty, quiet)
    if (process.env.NODE_ENV !== 'test') {
      PopApi.httpLogger = this.getLogger('http', pretty, quiet)
    }
  }

  /**
   * Check if the message is empty and replace it with the meta.
   * @param {!Object} args - The object to be logged.
   * @returns {Object} - The object to be logged.
   */
  checkEmptyMessage(args: Object): Object {
    if (args.message === '' && Object.keys(args.meta).length !== 0) {
      args.message = JSON.stringify(args.meta)
    }

    return args
  }

  /**
   * Get the color of the output based on the log level.
   * @param {?string} [level=info] - The log level.
   * @returns {string} - A color based on the log level.
   */
  getLevelColor(level: string = 'info'): string {
    const colors = {
      error: '\x1b[31m',
      warn: '\x1b[33m',
      info: '\x1b[36m',
      debug: '\x1b[34m'
    }

    return colors[level]
  }

  /**
   * Formatter method which formats the output to the console.
   * @param {!Object} args - The object to be logged.
   * @returns {string} - The formatted message for the console transport.
   */
  consoleFormatter(args: Object): string {
    const { level, message } = this.checkEmptyMessage(args)
    const color = this.getLevelColor(level)

    return sprintf(
      `\x1b[0m[%s] ${color}%5s:\x1b[0m %2s/%d: \x1b[36m%s\x1b[0m`,
      new Date().toISOString(),
      level.toUpperCase(),
      this.name,
      process.pid,
      message
    )
  }

  /**
   * Formatter method which formats the output to the log file.
   * @param {!Object} args - The object to be logged.
   * @returns {string} - The formatted message for the file transport.
   */
  fileFormatter(args: Object): string {
    const { level, message } = this.checkEmptyMessage(args)
    return JSON.stringify({
      name: this.name,
      pid: process.pid,
      level,
      msg: message,
      time: new Date().toISOString()
    })
  }

  /**
   * Create a Console transport.
   * @param {?boolean} [pretty] - Pretty mode for output with colors.
   * @returns {Object} - A configured Console transport.
   */
  getConsoleTransport(pretty?: boolean): Object {
    const f = pretty
      ? format.printf(this.consoleFormatter.bind(this))
      : format.simple()

    return new transports.Console({
      name: this.name,
      format: f
    })
  }

  /**
   * Create a File transport.
   * @param {!string} file - The file to log the output to.
   * @returns {Object} - A configured File transport.
   */
  getFileTransport(file: string): Object {
    if (!Logger.fileTransport) {
      Logger.fileTransport = new transports.File({
        level: 'warn',
        filename: join(...[
          this.logDir,
          `${file}.log`
        ]),
        format: format.printf(this.fileFormatter.bind(this)),
        maxsize: 5242880,
        handleExceptions: true
      })
    }

    return Logger.fileTransport
  }

  /**
   * Create a logger instance.
   * @param {!string} suffix - The suffix for the log file.
   * @param {?boolean} [pretty] - Pretty mode for output with colors.
   * @returns {Winston} - A configured logger instance.
   */
  createLoggerInstance(suffix: string, pretty?: boolean): Winston {
    const id = `${this.name}-${suffix}`

    return loggers.add(id, {
      levels: this.levels,
      level: 'debug',
      exitOnError: false,
      transports: [
        this.getConsoleTransport(pretty),
        this.getFileTransport(id)
      ]
    })
  }

  /**
   * Get the log message for Http logger.
   * @param {!Object} req - The request object to log.
   * @param {!Object} res - The response object to log.
   * @returns {string} - The HtpP log message to print.
   */
  getHttpLoggerMessage(req: $Response, res: $Response): string {
    return `HTTP ${req.method} ${req.url} ${res.statusCode} ${res.responseTime}ms`
  }

  /**
   * Create a Http logger instance.
   * @param {?boolean} [pretty] - Pretty mode for output with colors.
   * @returns {ExpressWinston} - A configured Http logger instance.
   */
  createHttpLogger(pretty?: boolean): Middleware {
    const logger = this.createLoggerInstance('http', pretty)
    const options: {
      [key: string]: mixed
    } = {
      winstonInstance: logger,
      meta: true,
      msg: this.getHttpLoggerMessage,
      statusLevels: true
    }

    if (process.env.NODE_ENV === 'development') {
      const { Console } = transports
      logger.add(new Console({
        name: this.name,
        format: format.json({
          space: 2
        })
      }))

      options.requestWhitelist = [].concat(requestWhitelist, 'body')
      options.responseWhitelist = [].concat(responseWhitelist, 'body')
    }

    return httpLogger(options)
  }

  /**
   * Method to create a global logger object based on the properties of the
   * Logger class.
   * @param {?boolean} [pretty] - Pretty mode for output with colors.
   * @param {?boolean} [quiet] - No output.
   * @returns {Object|Winston} - A configured logger.
   */
  createLogger(pretty?: boolean, quiet?: boolean): Object | Winston {
    const logger = this.createLoggerInstance('app', pretty)

    if (quiet) {
      Object.keys(this.levels).map(level => {
        logger[level] = () => {}
      })
    }

    return logger
  }

  /**
   * Get a logger object based on the choice.
   * @param {?string} [type] - The choice for the logger object.
   * @param {?boolean} [pretty] - Pretty mode for output with colors.
   * @param {?boolean} [quiet] - No output.
   * @returns {Middleware|Winston|undefined} - The logger object.
   */
  getLogger(
    type?: string,
    pretty?: boolean,
    quiet?: boolean
  ): Middleware | Winston | void {
    if (!type) {
      return undefined
    }

    const t = type.toUpperCase()

    switch (t) {
      case 'HTTP':
        return this.createHttpLogger(pretty)
      case 'LOGGER':
        return this.createLogger(pretty, quiet)
      default:
        return undefined
    }
  }

}
