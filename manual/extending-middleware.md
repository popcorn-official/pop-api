# Extending Middleware

 - [Cli](#cli)
 - [Database](#database)
 - [Logger](#logger)
 - [Routes](#routes)
 - [Using Custom Middlewares](#using-custom-middlewares)

## Cli

TODO: Add documentation how to add more cli options

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

TODO: Add documentation how to setup for MySql

```js
// ./middlewares/MySqlDatabase.js
import mysql from 'mysql'
import { Database } from 'pop-api'

export default class MySqlDatabase extends Database {

  /**
   * @override
   */
  constructor(PopApi: any, {
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

TODO: Add documentation how to setup for Pino

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

TODO: Add documentation how to setup for Restify

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

TODO: Add documentation how to use custom middlewares

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
    // The 'init' method  can take a list of middlewares as a second parameter.
    // This list of middlewares will be used by the PopApi instance. All the
    // middlewares will be initiated with options from the 'init' method, so
    // you can add additional options to your middleware.
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
    console.log(err)
  }
})()
```
