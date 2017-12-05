# pop-api

[![Build Status](https://travis-ci.org/popcorn-official/pop-api.svg?branch=master)](https://travis-ci.org/popcorn-official/pop-api)
[![Coverage Status](https://coveralls.io/repos/github/popcorn-official/pop-api/badge.svg?branch=master)](https://coveralls.io/github/popcorn-official/pop-api?branch=master)
[![Dependency Status](https://david-dm.org/popcorn-official/pop-api.svg)](https://david-dm.org/popcorn-official/pop-api)
[![devDependencies Status](https://david-dm.org/popcorn-official/pop-api/dev-status.svg)](https://david-dm.org/popcorn-official/pop-api?type=dev)

## Features

The pop-api project aims to provide the core modules for the
[`popcorn-api`](https://github.com/popcorn-official/popcorn-api) project, but
can also be used for other purposes by using middleware.
 - Cli middleware for reading user input with [`commander.js`](https://github.com/tj/commander.js).
 - Database middleware for connection to MongoDB through [`mongoose`](https://github.com/Automattic/mongoose).
 - Logging of routes and other information using [`winston`](https://github.com/winstonjs/winston).
 - Uses [`express`](https://github.com/expressjs/express) under the hood with:
   - Body middleware
   - Error handling
   - Security middleware
 - Interface for registering routes for [`express`](https://github.com/expressjs/express).
 - Data Access Layer (DAL) class for standard CRUD operations.
 - Route controller to handle routes for your content.

## Installation

```
 $ npm install --save pop-api
```

## Usage

### Basic setup

For your basic setup you have to create a controller which will handle the
routes. Your controller needs to extend from the `IController` interface to
implement the `registerRoutes` method which will be called during the setup.

The route controller below will be created with a constructor which takes an
object as the parameter. This example will register a `GET /hello` route and
sends a JSON object as a response with a greeting to the name provided by the
object from the constructor.

```js
// ./MyRouteController.js
import { IController } from 'pop-api'

// Extend your route controller from the 'IController' interface.
export default class MyRouteController extends IController {

  // The constructor takes an object as the parameter.
  constructor({name}) {
    super()

    this.name = name
  }

  // Implement the 'registerRoutes' method from the 'IController interface.
  registerRoutes(router, PopApi) {
    router.get('/hello', this.getHello.bind(this))
  }

  // Router middleware to execute on the 'GET /hello' route.
  getHello(req, res, next) {
    return res.json({
      message: `Hello, ${this.name}`
    })
  }

}
```

To initialize the API we create an array of the route controllers and their
constructor arguments we want to register. Then we just call the `init` method
with the route controllers array, and the name and version your API (needed for
the Cli). The API should run by default on port `5000`.

```js
// ./index.js
import { PopApi } from 'pop-api'
import MyRouteController from './MyRouteController'
import { name, version } from './package.json'

;(async () => {
  try {
    // Define the controllers you want to use.
    const controllers = [{
      Controller: MyRouteController,  // The controller to register.
      args: {                         // The arguments passed down to the
        name: 'John'                  // The additional arguments to pass to
                                      // your route controller.
      }
    }]

    // Initiate your API with the necessary parameters.
    await PopApi.init({                
      controllers,  // The controllers to register.
      name,         // The name of your API.
      version       // The version of your API.
    })
    // API is available on port 5000.
    // GET http://localhost:5000/hello -> { message: 'Hello, John' }
  } catch (err) {
    console.log(err)
  }
})()
```

### Advanced setup

For the advanced setup we will create a model using
[`mongoose`](https://github.com/Automattic/mongoose) and a route controller
extending from `BaseContentController`. Below we create a simple
[`mongoose`](https://github.com/Atomattic/mongoose) model.

```js
// ./myModel.js
import mongoose, { Schema } from 'mongoose'

// Create a simple mongoose schema.
const mySchema =  new Schema({
  _id: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  slug: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
})

// Create a model from the schema.
export default mongoose.model('MyModel', mySchema)
```

Before we create a route controller we need a `ContentService` object which
ats as the DAL for the CRUD operations. The `ContentService` object will be
used as a parameter when creating the route controller.

```js
// ./myService.js
import { ContentService } from 'pop-api'
import MyModel from './myModel'

const myService = new ContentService({
  Model: MyModel,           // The model for the service.
  projection: { name: 1 },  // Projection used to display multiple items.
  query: {}                 // (Optional) The default query to fetch items.
})

// Methods available:
// - myService.getContents([base])
// - myService.getPage([sort, page, query])
// - myService.getContent(id, [projection])
// - myService.createContent(obj)
// - myService.createMany(arr)
// - myService.updateContent(id, obj)
// - myService.updateMany(arr)
// - myService.deleteContent(id)
// - myService.deleteMany(arr)
// - myService.getRandomContent()

export default myService
```

Now we create a route controller which extends from `BaseContentController`.
This route controller can be used on it's own or classes can extend from it to
implement new behaviour or override existing behaviour. The
`BaseContentController` class already implements the `registerRoutes` method
from `IController` and adds the following routes to your API (note the base
path will be taken from the `basePath` value of your route controller):
 - GET    `/examples`        Get a list of a available pages to get.
 - GET    `/examples/:page`  Get a page of models.
 - GET    `/example/:id`     Get a single model.
 - POST   `/examples`        Create a new model.
 - PUT    `/example/:id`     Update an existing model.
 - DELETE `/example/:id`     Delete a model.
 - GET    `/random/example`  Get a random model.

The following example extends from `BaseContentController`, registers the default
routes and implements a `GET /hello` route.

```js
// ./MyRouteController.js
import { BaseContentController } from 'pop-api'

// Extend from the `BaseContentController` which has defaults methods for CRUD
// operations.
export default class MyRouteController extends BaseContentController {

  // The constructor of `BaseContentController` needs an instance of
  // `ContentService` which we will create later. It can also take additional
  // parameters for your own implementation.
  constructor({basePath, service, name}) {
    // binds: this._baseBath and this._service.
    super({basePath, service})

    this.name = name
  }

  // Implement the 'registerRoutes' method from the 'IController interface.
  registerRoutes(router, PopApi) {
    // Call the `registerRoutes` method from the `BaseContentController` class
    // to register the default routes.
    super.registerRoutes(router, PopApi)

    // And add additional routes for your route controller.
    router.get('/hello', this.getHello.bind(this))
  }

  // Router middleware to execute on the 'GET /hello' route.
  getHello(req, res, next) {
    return res.json({
      message: `Hello, ${this.name}`
    })
  }

}
```

Now to initial your API we create a list of route controllers we want to
register with their constructor parameters. This example also shows additional
parameters to pass down to the `init` method of the `PopApi` instance.

```js
// ./index.js
import express from 'express'
import { PopApi, ContentService } from 'pop-api'
import { join } from 'path'
import MyRouteController from './MyRouteController'
import myService from './myService'
import { name, version } from './package.json'

;(async () => {
  try {
    // Define the controllers you want to use.
    const controllers = [{
      Controller: MyRouteController,  // The controller to register.
      args: {                         // The arguments passed down to the
                                      // constructor of the controller.
        basePath: 'example',          // The base path to register the routes
                                      // to.
        service: myService,           // The content service for the
                                      // BaseContentController.
        name: 'John'                  // The additional arguments to pass to
                                      // your route controller.
      }
    }]

    // Initiate your API with optional parameters.
    await PopApi.init({
      app: express(),          // The express instance  to use.
      controllers,             // The controllers to register.
      name,                    // The name of your API.
      version,                 // The version of your API.
      logDir: join(...[        // (Optional) The directory to store the log
                               // files in. Defaults to `./tmp`.
        __dirname,
        '..',
        'tmp'
      ]),
      hosts: ['11.11.11.11'],  // (Optional) The hosts to connect to for
                               // MongoDB. Defaults to `['localhost']`.
      dbPort: 27019,           // (Optional) The port of MongoDB to connect to
                               // Defaults to `27017`.
      username: 'myUsername',  // (Optional) The username to connect to.
                               // MongoDB. Defaults to `null`.
      password: 'myPassword',  // (Optional) The password to connect to.
                               // MongoDB. Defaults to `null`.
      serverPort: 8080,        // (Optional) The port to run your API on.
                               // Defaults to `5000`.
      workers: 4               // The amount of workers to fork for the server.
                               // Defaults to `2`.
    })
    // API is available on port 8080.

    // GET http://localhost:8080/hello
    // { "message": "Hello, John" }

    // GET http://localhost:8080/examples
    // ["/examples/1', "/examples/2"]

    // GET http://localhost:8080/examples/1
    // [
    //   { "_id": "578df3efb618f5141202a196", "name": "John" },
    //   { "_id": "578df3efb618f5141202a196", "name": "Mary" }
    // ]

    // GET http://localhost:8080/example/578df3efb618f5141202a196
    // { "_id": "578df3efb618f5141202a196", "name": "John", "slug": "john" }

    // POST http://localhost:8080/examples
    // body: { "name": "Mary", "slug": "mary" }
    // { "_id": "578df3efb618f5141202a196", "name": "Mary", "slug": "mary" }

    // PUT http://localhost:8080/example/578df3efb618f5141202a196
    // body: { "name": "James", "slug": "james" }
    // { "_id": "578df3efb618f5141202a196", "name": "James", "slug": "james" }

    // DELETE http://localhost:8080/example/578df3efb618f5141202a196
    // { "_id": "578df3efb618f5141202a196", "name": "James", "slug:" :james" }

    // GET http://localhost:8080/random/example -> { }
    // { "_id": "578df3efb618f5141202a196", "name": "Mary", "slug": "mary" }
  } catch (err) {
    console.log(err)
  }
})()
```

## API

 - [Cli](#cli)
 - [Database](#database)
 - [HttServer](#httpserver)
 - [Logger](#logger)
 - [Routes](#routes)
 - [Custom Middleware](#custom-middleware)

### Cli

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
const { pretty, quiet } = PopApi.loggerArgs
PopApi.use(Logger, {
  pretty,
  quiet
})
```

### Database

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

### HttpServer

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

### Logger

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
  pretty: true,                         // (Optional) Pretty output mode.
  quiet: false                          // (Optional) Quiet mode for no output.
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
const { expressLogger } = PopApi
PopApi.app.use(expressLogger)
```

### Routes

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

### Custom Middleware

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

## License

MIT License

Copyright (c) 2017 - pop-api - Released under the [MIT license](LICENSE.txt).

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
