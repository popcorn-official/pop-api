# Extending Middleware

TODO: introduction

## Cli

TODO: Add documentation how to add more cli options

```js
// @flow
/* eslint-disable no-console */
import { Cli } from 'pop-api'

/**
 * node.js command-line interfaces made easy
 * @external {Command} https://github.com/tj/commander.js
 */
export default class MyCli extends Cli {

  /**
   * Create a new Cli object.
   * @param {!PopApi} PopApi - The PopApi instance to bind the cli to.
   * @param {!Object} options - The options for the cli.
   * @param {?Array<string>} options.argv - The arguments to be parsed by
   * commander.
   * @param {!string} options.name - The name of the Cli program.
   * @param {!string} options.version - The version of the Cli program.
   */
  constructor(PopApi: any, {argv, name, version}: Object): void {
    super(PopApi, {name, version})

    if (argv) {
      this.run(PopApi, argv)
    }
  }

  /**
   * Initiate the options for the Cli.
   * @returns {undefined}
   */
  initOptions(): void {
    super.initOptions()

    return this.program
      .option('--my-option', 'My awesome option')
  }

  /**
   * Get the help message.
   * @returns {Array<string>} - The help message to print.
   */
  getHelp(): Array<string> {
    const baseHelp = super.getHelp()
    return baseHelp.concat([
      `    $ ${this.name} --my-option`
    ])
  }

  runMyOption(): void {
    console.log('Executing my awesome option')
  }

  /**
   * Run the Cli program.
   * @param {!PopApi} PopApi - The PopApi instance to bind the logger to.
   * @param {?Array<string>} argv - The arguments to be parsed by commander.
   * @returns {undefined}
   */
  run(PopApi: any, argv?: Array<string>): any {
    if (argv) {
      this.program.parse(argv)
    }

    if (this.program.myOption) {
      return this.runMyOption()
    }

    return super.run(PopApi)
  }

}
``

### Database

TODO: Add documentation how to setup for MySql

```js
// @flow
import mysql from 'mysql'
import { Database } from 'pop-api'

export default class MySqlDatabase extends Database {

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
   * The port of the database. Default is `3306`.
   * @type {string}
   */
  dbPort: number

  /**
   * The username of the database. DBy default this is left empty.
   * @type {string}
   */
  username: string

  /**
   * The password of the database. By default this is left empty.
   * @type {string}
   */
  password: string  

  /**
   * The connection object from MySql.
   * @type {Object}
   */
  connection: Object

  /**
   * Create a new MySqlDatabase object.
   * @param {!PopApi} PopApi - The PopApi instance to bind the database to.
   * @param {!Object} options - The options for the database.
   * @param {!string} options.database - The arguments to be parsed by
   * @param {!Array<string>} [options.hosts=['localhost']] - The hosts for the
   * MongoDb connection.
   * @param {!number} [options.dbPort=3306] - The port for the MySQL
   * connection.
   * @param {?string} [options.username] - The username for the MySQL
   * connection.
   * @param {?string} [options.password] - The password for the MySQL
   * connection.
   */
  constructor(PopApi: any, {
    database,
    hosts = ['localhost'],
    dbPort = 3306,
    username,
    password
  }: Object): void {
    super(PopApi, {
      database,
      hosts,
      dbPort,
      username,
      password
    })

    this.connection = mysql.createConnection({
      host: this.hosts[0],
      user: this.username,
      password: this.password,
      database: this.database,
      port: this.dbPort
    })
    PopApi.database = this
  }

  /**
   * Connection and configuration of the MySQL database.
   * @returns {Promise<string, Error>} - The promise to connect to MySQL.
   */
  connect(): Promise<string | Error> {
    return new Promise((resolve, reject) => {
      return this.connection
        .connect(err => err ? reject(err) : resolve('Connected'))
    })
  }

  /**
   * Disconnect from the MySQL database.
   * @returns {Promsise<void>} - The promise to disconnect from MySQL.
   */
  disconnect(): Promise<void> {
    return new Promise(resolve => this.connection.end())
  }

}
```

### Logger

TODO: Add documentation how to setup for Pino 

```js
// @flow
/**
 * super fast, all natural json logger
 * @external {Pino} https://github.com/pinojs/pino
 */
import pino from 'pino'
import { join } from 'path'
import { Logger } from 'pop-api'
import { sprintf } from 'sprintf-js'

export default class PinoLogger extends Logger {

  /**
   * Formatter method which formats the output to the console.
   * @param {!Object} args - Arguments passed by Winston.
   * @returns {string} - The formatted message.
   */
  consoleFormatter(args: Object): string {
    const level = pino.levels.labels[args.level]
    const color = this.getLevelColor(level)

    return sprintf(
      `\x1b[0m[%s] ${color}%5s:\x1b[0m %2s/%d: \x1b[36m%s\x1b[0m`,
      new Date(args.time).toISOString(),
      level.toUpperCase(),
      this.name,
      args.pid,
      args.msg
    )
  }

  /**
   * Create a logger instance.
   * @param {!string} suffix - The suffix for the log file.
   * @param {?boolean} [pretty] - Pretty mode for output with colors.
   * @returns {Pino} - A configured logger instance.
   */
  createLoggerInstance(suffix: string, pretty?: boolean): Pino {
    const prettyPino = pino.pretty({
      formatter: this.consoleFormatter.bind(this)
    })
    prettyPino.pipe(process.stdout)

    return pino({
      name: `${this.name}-${suffix}`,
      safe: true
    }, prettyPino)
  }

}
```

### HttpServer

### Routes

TODO: Add documentation how to setup for Restify

## Using Custom Middlewares

TODO: Add documentation how to use custom middlewares


```js
import restify from 'restify'
import { isMaster } from 'cluster'
import { join } from 'path'
import { PopApi, HttpServer, utils } from 'pop-api'
import { name, version } from '../package.json'

import {
  MyCli,
  MySqlDatabase,
  PinoLogger,
  RestifyRoutes
} from './middlewares' 

(async () => {
  try {
    // XXX: for v0.3.0
    // await PopApi.init({ name, version }, [
    //   MyCli,
    //   PinoLogger,
    //   MySqlDatabase,
    //   RestifyRoutes,
    //   HttpServer
    // ])

    const logDir = join(...[
      __dirname,
      '..',
      'tmp'
    ])
    PopApi.app = restify.createServer()
    if (isMaster) {
      await utils.createTemp(logDir)
    }

    PopApi.use(MyCli, {
      name,
      version,
      argv: process.argv
    })
    PopApi.use(PinoLogger, {
      name,
      logDir,
      ...PopApi.loggerArgs
    })
    PopApi.use(MySqlDatabase, {
      database: name,
      hosts: ['localhost'],
      username: 'root',
      password: 'root',
      dbPort: 3306
    })
    PopApi.use(RestifyRoutes, {
      app: PopApi.app
    })
    PopApi.use(HttpServer, {
      app: PopApi.app,
      workers: 2,
      serverPort: 5000
    })

    await PopApi.database.connect()
  } catch (err) {
    console.log(err)
  }
})()
```
