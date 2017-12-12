// Import the necessary modules.
// @flow
import bodyParser from 'body-parser'
import compress from 'compression'
import helmet from 'helmet'
import type {
  $Application,
  $Request,
  $Response,
  NextFunction
} from 'express'
import responseTime from 'response-time'
import { STATUS_CODES as statusMessages } from 'http'

import {
  ApiError,
  statusCodes
} from '../helpers'

/**
 * Class for setting up the Routes.
 * @type {Routes}
 */
export default class Routes {

  /**
   * Create a new Routes object.
   * @param {!PopApi} PopApi - The PopApi instance to bind the routes to.
   * @param {!Object} options - The options for the routes.
   * @param {!Express} options.app - The application instance to add middleware
   * and bind the routes to.
   * @param {?Array<Object>} options.controllers - The controllers to register.
   */
  constructor(PopApi: any, {app, controllers}: Object): void {
    this.setupRoutes(app, PopApi, controllers)
  }

  /**
   * Register the controllers found in the controllers directory.
   * @param {!Express} app - The application instance to register the routers
   * to.
   * @param {!PopApi} PopApi - The PopApi instance to bind the routes to.
   * @param {!Array<Object>} controllers - The controllers to register.
   * @returns {undefined}
   */
  registerControllers(
    app: $Application,
    PopApi: any,
    controllers: Array<Object>
  ): void {
    controllers.forEach(c => {
      const { Controller, args } = c
      const controller = new Controller(args)

      controller.registerRoutes(app, PopApi)
    })
  }

  /**
   * Convert the thrown errors to an instance of ApiError.
   * @param {!Error} err - The caught error.
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {ApiError} - The converted error.
   */
  convertErrors(
    err: Error,
    req: $Request,
    res: $Response,
    next: NextFunction
  ): mixed {
    if (!(err instanceof ApiError)) {
      const error = new ApiError({
        message: err.message
      })
      return next(error)
    }

    return next(err)
  }

  /**
   * Catch the 404 errors.
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {ApiError} - A standard 404 error.
   */
  setNotFoundHandler(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): mixed {
    const err = new ApiError({
      message: 'Api not found',
      status: statusCodes.NOT_FOUND
    })

    return next(err)
  }

  /**
   * Error handler middleware
   * @param {!ApiError} err - The caught error.
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Object} - The error object.
   */
  setErrorHandler(
    err: ApiError,
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Object {
    const { status } = err
    const body: {
      [key: string]: string
    } = {
      message: err.isPublic
        ? err.message
        : `${status} ${statusMessages[status]}`
    }

    if (process.env.NODE_ENV === 'development') {
      body.stack = err.stack
    }

    res.setHeader('Content-Type', 'application/json')
    res.status(status)
    return res.send(body)
  }

  /**
   * Remove security sensitive headers.
   * @see https://github.com/shieldfy/API-Security-Checklist#output
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {undefined}
   */
  removeServerHeader(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): mixed {
    res.removeHeader('Server')
    return next()
  }

  /**
   * Hook method for setting up middleware pre setting up the routes.
   * @param {!Express} app - The application instance to add middleware to.
   * @returns {undefined}
   */
  preRoutes(app: $Application): void {
    // Enable parsing URL encoded bodies.
    app.use(bodyParser.urlencoded({
      extended: true
    }))

    // Enable parsing JSON bodies.
    app.use(bodyParser.json())

    // Enables compression of response bodies.
    app.use(compress({
      threshold: 1400,
      level: 4,
      memLevel: 3
    }))

    // Enable response time tracking for HTTP request.
    app.use(responseTime())

    // Set and remove the security sensitive headers.
    app.use(helmet())
    // app.use(helmet.contentSecurityPolicy({
    //   directives: {
    //     defaultSrc: ['\'none\'']
    //   }
    // }))
    app.use(this.removeServerHeader)
  }

  /**
   * Hook method for setting up middleware post setting up the routes.
   * @param {!Express} app - The application instance to add middleware to.
   * @returns {undefined}
   */
  postRoutes(app: $Application): void {
    // Convert the caught errors to the ApiError instance.
    app.use(this.convertErrors)

    // Set the default not found handling middleware.
    app.use(this.setNotFoundHandler)

    // Set the default error handling middleware.
    app.use(this.setErrorHandler)
  }

  /**
   * Setup the application service.
   * @param {!Express} app - The application instance to add middleware and
   * bind the routes to.
   * @param {!PopApi} PopApi - The PopApi instance to bind the routes to.
   * @param {?Array<Object>} [controllers] - The controllers to register.
   * @returns {undefined}
   */
  setupRoutes(
    app: $Application,
    PopApi?: any,
    controllers?: Array<Object>
  ): void {
    // Pre routes hook.
    this.preRoutes(app)

    // Enable HTTP request logging.
    if (PopApi && PopApi.httpLogger) {
      app.use(PopApi.httpLogger)
    }

    // Register the controllers.
    if (controllers) {
      this.registerControllers(app, PopApi, controllers)
    }

    // Post routes hook.
    this.postRoutes(app)
  }

}
