# Middleware

 - [Cli](#cli)
 - [Database](#database)
 - [HttServer](#httpserver)
 - [Logger](#logger)
 - [Routes](#routes)
 - [Custom Middleware](#custom-middleware)

## Cli

The `Cli` middleware uses [`commander.js`](https://github.com/tj/commander.js)
modules to parse the input of the user. The middleware itself doesn't bind
anything to the `PopApi` instance, instead it parses the input and run the API
accordingly.

```js
import { PopApi, Cli, Logger } from 'pop-api'
import { name, version } from './package.json'

const cliOpts = {
  name,               // The name of your application
  version,            // The version of your application
  argv: process.argv  // The arguments to parse
}
PopApi.use(Cli, cliOpts)

// Parsed the input given and binds options for the `Logger` middleware.
// See the documentation for the `Logger` middleware for more options.
const { pretty } = PopApi.loggerArgs
PopApi.use(Logger, { pretty })
```

## Database

The `Database` middleware bind the `database` key to the `PopApi` instance.
This middleware allows you to `connect()` and `disconnect()` from MongoDB
through [`mongoose`](https://github.com/Automattic/mongoose), and you can
export and import a collection with the
`exportCollection(collection, outputFile)` and
`importCollection(collection, jsonFile)` methods. The example below uses a
`.env` file to store the optional `username` and `password` values to establish
a connection with MongoDB.

```dosini
# .env
# (Optional) Assuming you use the `dotenv` modules to get your username and
# password for the database connection
DATABASE_USERNAME=myUsername
DATABASE_PASSWORD=myPassword
```

Now setup the `Database` middleware:

```js
// (Optional) Assuming you use the `dotenv` modules to get your username and
// password for the database connection
import 'dotenv/config'
import { PopApi, Database } from 'pop-api'
import MyModel from './MyModel'
import { name } from './package.json'

const databaseOpts = {
  database: name,                           // The name of the database.
  hosts: ['localhost'],                     // A lst of hosts to connect to.
  dbPort: 27017,                            // (Optional) The port of MongoDB.
  username: process.env.DATABASE_USERNAME,  // (Optional) The username to
                                            // connect to the hosts.
  password: process.env.DATABASE_PASSWORD   // (Optional) The password to
                                            // connect to the hosts.
}
PopApi.use(Database, databaseOpts)

// The database middleware can now be used to connect to the MongoDB database.
PopApi.database.connect()
  .then(() => {
    // Connection successful!
    return new MyModel({
      _id: 'John',
      name: 'John',
      slug: 'john'
    }).save()
  })
  .catch(err => {
    // Handle error
  })
  .then(() => {
    // Disconnect from MongoDB.
    PopApi.database.disconnect()
  })
```

## HttpServer

The `HttpServer` middleware forks workers so heavy load process can run on
different child processes. It also makes the
 [`express`](https://github.com/expressjs/express) app listen on a port.

```js
import { PopApi, HttpServer } from 'pop-api'

const httpServerOpts = {
  app: PopApi.app,   // The express instance from PopApi.
  serverPort: 5000,  // The port your API will be running on.
  workers: 2         // The amount of workers to fork.
}
PopApi.use(HttpServer, httpServerOpts)
// Doesn't bind anything to the PopApi instance, just forks the workers and
// makes the app listen on your configured port.
```

## Logger

The `Logger` middleware uses the
[`winston`](https://github.com/winstonjs/winston) module to create a global
`logger` object. This `logger` object has various levels to log, such as
`debug`, `info`, `warn` and `error`. This middleware also binds an
[`express`](https://github.com/expressjs/express) middleware function to log
the routes.

```js
import { PopApi, Logger } from 'pop-api'
import { join } from 'path'
import { name } from './package.json'

const loggerOpts = {
  name,                                 // The name of the log file.
  logDir: join(...[__dirname, 'tmp']),  // The directory to store the logs in.
  pretty: true                          // (Optional) Pretty output mode.
}
PopApi.use(Logger, loggerOpts)

logger.info('\logger\' will be a global object')
// Other log levels you can use are:
//  - logger.debug()
//  - logger.info()
//  - logger.warn()
//  - logger.error()

// Log middleware for logging routes, used by the `Routes` middleware, or set
// it yourself.
const { httpLogger } = PopApi
PopApi.app.use(httpLogger)
```

## Routes

The `Routes` middleware configures the
[`express`](https://github.com/expressjs/express) instance. It sets up the
[`body-parser`](https://github.com/expressjs/body-parser) and
[`compression`](https://github.com/exprssjs/compression) middleware, as well as
the error and security middleware. Thirdly it registers the controllers with
their routes.

```js
import { PopApi, Routes } from 'pop-api'
import MyRouteController from './MyRouteController'

const routesOpts = {
  app: PopApi.app,                  // The express instance from PopApi.
  controllers: [{                   // A list of controllers to register.
    Controller: MyRouteController,  // The controller you want to register.
    args: {}                        // The arguments to pass down to the
                                    // MyRouteController.
  }]
}
PopApi.use(Routes, routesOpts)
// Doesn't bind anything to the PopApi instance, just configures the middleware
// for express and registers the controllers.
```

## Custom Middleware

The `init` method will register the default Cli, Database, Logger, Routes and
Server middleware, but you can also extends the functionality of `pop-api` by
using your own middleware. In the middleware example below we create a
middleware class which will only hold a simple greeting.

```js
// ./MyMiddleware.js
export default class MyMiddleware {

  // The first parameter will be the 'PopApi' instance, the second will be an
  // object you can use to configure your middleware.
  constructor(PopApi, {name}) {
    this.name = name

    PopApi.myMiddleware = this.myMiddleware()
  }

  myMiddleware() {
    return `Hello, ${this.name}`
  }

}
```

To use the middleware we created you call the `use` method. The first parameter
will be the middleware class you want to create, the second parameter is
optional, but can be used to configure your middleware.

```js
// ./index.js
import { PopApi } from 'pop-api'
import MyMiddleware from './MyMiddleware'

// Use the middleware you created.
PopApi.use(MyMiddleware, {
  name: 'John'
})

// The middleware will be bound to the 'PopApi' instance.
const greeting = PopApi.myMiddleware
console.log(greeting) // Hello, John
```
