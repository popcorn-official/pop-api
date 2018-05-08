# Extending Middleware

The behaviour of the default middlewares can be overwritten or extended by
creating a new class which extends from the base middleware class. This section
will look into how you can do this for your own project.
 - [Cli](#cli)
 - [Database](#database)
 - [Logger](#logger)
 - [Routes](#routes)
 - [Using Custom Middlewares](#using-custom-middlewares)

## Cli

The `CLi` middleware uses [`commander.js`](https://github.com/tj/commander) for
parsing the command line input. The following example overrides the
`initOptions` method to add additional options for your cli middleware. It also
overrides the `getHelp` method to add an example which will be printed wiith
the `--help` flag. Lastly it overrides the `run` method which parses the cli
input and runs the prrogram based on the input.

```js
// ./middlewares/MyCli.js
import { Cli } from 'pop-api'

export default class MyCli extends Cli {

  /**
   * @override
   */
  constructor(PopApi, {argv, name, version, myCliOption}) {
    // Do not pass down the 'argv' key so it does not get parsed by commander.
    super(PopApi, {name, version})

    // Bind our option to the instance.
    this.myCliOption = myCliOption

    // Run the Cli middleware.
    this.run(PopApi, argv)
  }

  /**
   * @override
   */
  initOptions() {
    // First initiate the options from the base Cli middleware.
    super.initOptions()

    // Now you can add your own options.
    return this.program
      .option('--my-option', 'My awesome option')
  }

  /**
   * @override
   */
  getHelp() {
    // Get the help message from the base Cli middleware.
    const baseHelp = super.getHelp()

    // And add your own message for your options.  
    return baseHelp.concat([
      `    $ ${this.name} --my-option`
    ])
  }

  // Method ot be executed when the `--my-option` flag is set.
  runMyOption() {
    console.log(`Executing my awesome option: ${this.myCliOption}`)
  }

  /**
   * @override
   */
  run(PopApi, argv) {
    // Now we parse the options.
    this.program.parse(argv)

    // Check the use input if your option flag has been filled.
    if (this.program.myOption) {
      return this.runMyOption()
    }

    // Run any other input options from the base Cli middleware.
    return super.run(PopApi)
  }

}
```

### Database

By default the `Database` middleware uses
[`mongoose`](https://github.com/Automattic/mongoose) to create a Connection to
MongoDB. For this example we will create a MySQL connection with the
[`mysql`](https://github.com/mysqljs/mysql) module. It overrides the `connect`
and `disconnect` methods to establish and end a connection.

```js
// ./middlewares/MySqlDatabase.js
import mysql from 'mysql'
import { Database } from 'pop-api'

export default class MySqlDatabase extends Database {

  /**
   * @override
   */
  constructor(PopApi, {
    database,
    hosts = ['localhost'],
    dbPort = 3306,
    username,
    password
  }) {
    super(PopApi, {
      database,
      hosts,
      dbPort,
      username,
      password
    })

    // Bind the connection to the instance to connect and disconnect.
    this.connection = mysql.createConnection({
      host: this.hosts[0],
      user: this.username,
      password: this.password,
      database: this.database,
      port: this.dbPort
    })
    // Set the database middleware as an instance of MySqlDatabase.
    PopApi.database = this
  }

  /**
   * @override
   */
  connect()  {
    return new Promise((resolve, reject) => {
      return this.connection
        .connect(err => err ? reject(err) : resolve('Connected'))
    })
  }

  /**
   * @override
   */
  disconnect() {
    return new Promise(resolve => this.connection.end())
  }

}
```

### Logger

The `Logger` middleware uses [`winston`](https://github.com/winstonjs/winston)
by default as a logger. Here we will extend the default logger middleware to
use [`pino`](). We override the `createLoggerInstance` to create an instance of
`pino` and override the `consoleFormatter` to use as a formatter function for
`pino`.

```js
// ./middlewares/PinoLogger.js
import pino from 'pino'
import { join } from 'path'
import { Logger } from 'pop-api'
import { sprintf } from 'sprintf-js'

export default class PinoLogger extends Logger {

  /**
   * @override
   */
  consoleFormatter(args) {
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
   * @override
   */
  createLoggerInstance(suffix, pretty) {
    // Let the http logger middleware be handled by the base Logger middleware.
    if (suffix === 'http') {
      return super.createLoggerInstance(suffix, pretty)
    }

    const prettyPino = pino.pretty({
      // Or don't use a formatter at all.
      formatter: this.consoleFormatter.bind(this)
    })
    prettyPino.pipe(process.stdout)

    // Create our logger object.
    return pino({
      name: `${this.name}-${suffix}`,
      safe: true
    }, prettyPino)
  }

}
```

### Routes

The default web framework used by the `Routes` middleware is
[`express`](https://github.com/expressjs/express). For this example we will
extend the `Routes` middleware to use
[`restfy`](https://github.com/restify/node-restify) as the web framework. For
this we will override the `preRoutes` method to use middleware for `restify`
instead of `express`.

```js
// ./middlewares/RestifyRoutes.js
import helmet from 'helmet'
import restify from 'restify'
import { Routes } from 'pop-api'

export default class RestifyRoutes extends Routes {

  /**
   * @override
   */
  preRoutes(app) {
    // Register the middleware plugins for Restify.
    app.use(restify.plugins.bodyParser())
    app.use(restify.plugins.queryParser())
    app.use(restify.plugins.gzipResponse())

    // Use helmet middleware or any other for Restify.
    app.use(helmet())
    app.use(helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ['\'none\'']
      }
    }))
    app.use(this.removeServerHeader)
  }

}
```

## Using Custom Middlewares

The 'init' method  can take a list of middlewares as a second parameter. This
list of middlewares will be used by the PopApi instance. All the middlewares
will be initiated with options from the 'init' method, so you can add
additional options to your middleware.

```js
// ./index.js
import restify from 'restify'
import { PopApi, HttpServer, utils } from 'pop-api'

import {
  MyCli,
  MySqlDatabase,
  PinoLogger,
  RestifyRoutes
} from './middlewares'
import { name, version } from '../package.json'

(async () => {
  try {
    await PopApi.init({
      name,
      version,
      myCliOption,
      ...
    }, [
      MyCli, // Will be initiated with additional 'myCliOption' value.
      PinoLogger,
      MySqlDatabase,
      RestifyRoutes,
      HttpServer
    ])
  } catch (err) {
    console.error(err)
  }
})()
```
