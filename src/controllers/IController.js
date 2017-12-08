// @flow

/**
 * Interface for the route controllers.
 * @interface
 * @type {IController}
 */
export default class IController {

  /**
   * Default method to register the routes.
   * @abstract
   * @param {!Object} router - The router to register the routes to.
   * @param {?PopApi} [PopApi] - The PopApi instance.
   * @throws {Error} - Using default method: 'registerRoutes'
   * @returns {undefined}
   */
  registerRoutes(router: Object, PopApi?: any): void {
    throw new Error('Using default method: \'registerRoutes\'')
  }

}
