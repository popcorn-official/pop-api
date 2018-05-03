# pop-api

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![devDependency Status][david-dev-image]][david-dev-url]
[![Conventional Commits][commits-image]][commits-url]

[travis-image]: https://travis-ci.org/popcorn-official/pop-api.svg?branch=master
[travis-url]: https://travis-ci.org/popcorn-official/pop-api
[coveralls-image]: https://coveralls.io/repos/github/popcorn-official/pop-api/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/popcorn-official/pop-api?branch=master
[david-image]: https://david-dm.org/popcorn-official/pop-api.svg
[david-url]: https://david-dm.org/popcorn-official/pop-api
[david-dev-image]: https://david-dm.org/popcorn-official/pop-api/dev-status.svg
[david-dev-url]: https://david-dm.org/popcorn-official/pop-api?type=dev
[commits-image]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-green.svg
[commits-url]: https://conventionalcommits.org

## Features

The pop-api project aims to provide the core modules for the
[`popcorn-api`](https://github.com/popcorn-official/popcorn-api) project, but
can also be used for other purposes by using middleware.
 - Cli middleware for reading user input with [`commander.js`](https://github.com/tj/commander.js).
 - Database middleware for connection to MongoDB through [`mongoose`](https://github.com/Automattic/mongoose).
 - Logging of routes and other information using [`winston`](https://github.com/winstonjs/winston).
 - Uses [`express`](https://github.com/expressjs/express) under the hood with:
   - Body middleware with [`body-parser`](https://github.com/expressjs/body-parser)
   - Error handling
   - Security middleware with [`helmet`](https://github.com/helmetjs/helmet)
 - Interface for registering routes for [`express`](https://github.com/expressjs/express).
 - Data Access Layer (DAL) class for standard CRUD operations.
 - Route controller to handle routes for your content.

## Installation

```
 $ npm install --save pop-api
```

## Documentation

 - [General documentation](https://popcorn-official.github.io/pop-api/manual/index.html)
 - [Api docs](https://popcorn-official.github.io/pop-api/identifiers.html)
 - [Usage](https://popcorn-official.github.io/pop-api/manual/usage.html)
 - [Middleware](https://popcorn-official.github.io/pop-api/manual/middleware.html)
 - [Advanced Usage](https://popcorn-official.github.io/pop-api/manual/advanced.html)
 - [Extending Middleware](https://popcorn-official.github.io/pop-api/manual/extending-middleware.html)

## Usage

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

## License

MIT License
