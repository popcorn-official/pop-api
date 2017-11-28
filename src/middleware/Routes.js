// Import the necessary modules.
// @flow
import bodyParser from 'body-parser'
import compress from 'compression'
import express, {
  type $Application,
  type $Request,
  type $Response,
  type NextFunction
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
   * @param {!Express} options.app - The Express application.
   * @param {?Array<Object>} options.controllers - The controllers to register.
   */
  constructor(PopApi: any, {app, controllers}: Object): void {
    this._setupExpress(app, PopApi, controllers)

    PopApi.app = app
  }

  /**
   * Register the controllers found in the controllers directory.
   * @param {!Express} app - The Express instance to register the routers to.
   * @param {!PopApi} PopApi - The PopApi instance to bind the routes to.
   * @param {!Array<Object>} controllers - The controllers to register.
   * @returns {undefined}
   */
  _registerControllers(
    app: $Application,
    PopApi: any,
    controllers: Array<Object>
  ): void {
    controllers.forEach(c => {
      const { Controller, args } = c
      const controller = new Controller(args)

      const router = express.Router()
      controller.registerRoutes(router, PopApi)

      app.use('/', router)
    })
  }

  /**
   * Convert the thrown errors to an instance of ApiError.
   * @param {!Error} err - The caught error.
   * @param {!Object} req - The ExpressJS request object.
   * @param {!Object} res - The ExpressJS response object.
   * @param {!Function} next - The ExpressJS next function.
   * @returns {ApiError} - The converted error.
   */
  _convertErrors(
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
   * @param {!Object} req - The ExpressJS request object.
   * @param {!Object} res - The ExpressJS response object.
   * @param {!Function} next - The ExpressJS next function.
   * @returns {ApiError} - A standard 404 error.
   */
  _setNotFoundHandler(
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
   * @param {!Object} req - The ExpressJS request object.
   * @param {!Object} res - The ExpressJS response object.
   * @param {!Function} next - The ExpressJS next function.
   * @returns {Object} - The error object.
   */
  _setErrorHandler(
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

    return res.status(status).json(body)
  }

  /**
   * Add security sensitive headers.
   * @see https://github.com/shieldfy/API-Security-Checklist#output
   * @param {!Object} req - The ExpressJS request object.
   * @param {!Object} res - The ExpressJS response object.
   * @param {!Function} next - The ExpressJS next function.
   * @returns {undefined}
   */
  _addSecHeaders(req: $Request, res: $Response, next: NextFunction): mixed {
    res.setHeader('X-Content-Type-Options', 'no-sniff')
    res.setHeader('X-Frame-Options', 'deny')
    res.setHeader('Content-Security-Policy', 'default-src: \'none\'')

    return next()
  }

  /**
   * Remove security sensitive headers.
   * @see https://github.com/shieldfy/API-Security-Checklist#output
   * @param {!Object} req - The ExpressJS request object.
   * @param {!Object} res - The ExpressJS response object.
   * @param {!Function} next - The ExpressJS next function.
   * @returns {undefined}
   */
  _removeSecHeaders(req: $Request, res: $Response, next: NextFunction): mixed {
    res.removeHeader('X-Powered-By')
    res.removeHeader('X-AspNet-Version')
    res.removeHeader('Server')

    return next()
  }

  /**
   * Setup the ExpressJS service.
   * @param {!Express} app - The ExpressJS instance.
   * @param {!PopApi} PopApi - The PopApi instance to bind the routes to.
   * @param {!Array<Object>} controllers - The controllers to register.
   * @returns {undefined}
   */
  _setupExpress(
    app: $Application,
    PopApi?: any,
    controllers?: Array<Object>
  ): void {
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

    // Enable HTTP request logging.
    if (PopApi && PopApi.expressLogger) {
      app.use(PopApi.expressLogger)
    }

    // Set and remove the security sensitive headers.
    app.use(this._addSecHeaders)
    app.use(this._removeSecHeaders)

    // Register the controllers.
    if (controllers) {
      this._registerControllers(app, PopApi, controllers)
    }

    // Convert the caught errors to the ApiError instance.
    app.use(this._convertErrors)

    // Set the default not found handling middleware.
    app.use(this._setNotFoundHandler)

    // Set the default error handling middleware.
    app.use(this._setErrorHandler)
  }

}
