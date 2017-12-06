# Advanced Setup

TODO: introduction

## Mongoose Models

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

## ContentService

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

## Controllers

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

## The setup

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
