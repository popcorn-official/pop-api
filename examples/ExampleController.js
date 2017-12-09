// Import the necessary modules.
// @flow
import type {
  $Response,
  $Request,
  NextFunction
} from 'express'

import {
  ApiError,
  BaseContentController,
  statusCodes
} from '../src'

/**
 * An example controller to register.
 * @implements {BaseContentController}
 * @type {ExampleController}
 */
export default class ExampleController extends BaseContentController {

  /**
   * Default method to register the routes.
   * @override
   * @param {!Object} router - The router to register the routes to.
   * @param {?PopApi} [PopApi] - The PopApi instance.
   * @returns {undefined}
   */
  registerRoutes(router: Object, PopApi?: any): void {
    // Include the routes from the BaseContentController.
    super.registerRoutes(router, PopApi)

    // Assuming PopApi has authentication middleware registered.
    if (PopApi && PopApi.authMiddleware) {
      router.get('/hello/:name', PopApi.authMiddleware, this.getHello)
    } else {
      router.get('/hello/:name', this.getHello)
    }

    router.get('/error', this.getError)
    router.get('/custom-error', this.getCustomError)
  }

  /**
   * Say hello to a user.
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Object} - Object with a message saying the name parameter.
   */
  getHello(req: $Request, res: $Response, next: NextFunction): $Response {
    const { name } = req.params
    return res.json({
      message: `Hello, ${name}`
    })
  }

  /**
   * Throw an error on purpose as a demonstration.
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @throws {Error} - An error occurred!
   * @returns {Error} - A demonstration error.
   */
  getError(req: $Request, res: $Response, next: NextFunction): mixed {
    const err = new Error('An error occurred!')
    return next(err)
  }

  /**
   * Throw a custom error on purpose as a demonstration.
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @throws {Error} - A custom error occurred!
   * @returns {Error} - A demonstration error.
   */
  getCustomError(req: $Request, res: $Response, next: NextFunction): mixed {
    const err = new ApiError({
      message: 'A custom error occurred!',
      status: statusCodes.INTERNAL_SERVER_ERROR,
      isPublic: true
    })
    return next(err)
  }

}
