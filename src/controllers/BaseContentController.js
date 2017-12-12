// Import the necessary modules.
// @flow
import type {
  $Response,
  $Request,
  NextFunction
} from 'express'
import type { MongooseModel } from 'mongoose'

import IController from './IController'
import type ContentService from './ContentService'

/** @external {IncomingMessage} https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_incomingmessage */
/** @external {ServerResponse} https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_serverresponse */

/**
 * Base class for getting content from endpoints.
 * @implements {IContentController}
 * @type {BaseContentController}
 */
export default class BaseContentController extends IController {

  /**
   * The base path for the routes.
   * @type {string}
   */
  basePath: string

  /**
   * The service of the content controller.
   * @type {ContentService}
   */
  service: ContentService

  /**
   * Create a new base content controller.
   * @param {!Object} options - The options for the base content controller.
   * @param {!string} options.basePath - The base path for the routes.
   * @param {!ContentService} options.service - The service for the content
   * controller.
   */
  constructor({basePath, service}: Object): void {
    super()

    /**
     * The base path for the routes.
     * @type {string}
     */
    this.basePath = basePath
    /**
     * The service of the content controller.
     * @type {ContentService}
     */
    this.service = service
  }

  /**
   * Default method to register the routes.
   * @override
   * @param {!Object} router - The router to register the routes to.
   * @param {?PopApi} [PopApi] - The PopApi instance.
   * @returns {undefined}
   */
  registerRoutes(router: Object, PopApi?: any): void {
    const t = this.basePath

    router.get(`/${t}`, this.list.bind(this))
    router.get(`/${t}/:id`, this.get.bind(this))
    router.post(`/${t}`, this.create.bind(this))
    router.put(`/${t}/:id`, this.update.bind(this))
    router.get(`/random/${t}`, this.random.bind(this))
    if (typeof router.delete === 'function') {
      router.delete(`/${t}/:id`, this.remove.bind(this))
    } else {
      router.del(`/${t}/:id`, this.remove.bind(this))
    }
  }

  /**
   * Check if the content is empty or the length of the content array is zero.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Object|Array<Object>} content - The content to check.
   * @returns {Object} - Returns a 204 response if the content is empty, or a
   * 200 response with the content if it is not empty.
   */
  checkEmptyContent(res: $Response, content: any): Object {
    res.setHeader('Content-Type', 'application/json')
    if (!content || content.length === 0) {
      res.status(204)
      return res.send()
    }

    res.status(200)
    return res.send(content)
  }

  /**
   * Get a list of content models, allows to skip content models with 'page',
   * and sort content models with 'sort' and 'order'.
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Promise<Array<MongooseModel>, Error>} - The content models of a
   * page, max depends on 'pageSize'.
   */
  list(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<Array<MongooseModel> | mixed> {
    const { sort, order, page } = req.query
    const o = parseInt(order, 10) ? parseInt(order, 10) : -1
    const p = parseInt(page, 10) ? parseInt(page, 10) : 1

    return this.service.list(sort, o, p)
      .then(content => this.checkEmptyContent(res, content))
      .catch(err => next(err))
  }

  /**
   * Get the content from the database with an id.
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Promise<MongooseModel, Error>} - The details of the content.
   */
  get(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    return this.service.get(req.params.id)
      .then(content => this.checkEmptyContent(res, content))
      .catch(err => next(err))
  }

  /**
   * Insert one or multiple content models into the database.
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Promise<MongooseModel|Array<MongooseModel>, Error>} - The
   * created content model(s).
   */
  create(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    res.setHeader('Content-Type', 'application/json')
    return this.service.create(req.body)
      .then(content => res.send(content))
      .catch(err => next(err))
  }

  /**
   * Update one or multiple content models.
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Promise<MongooseModel|Array<MongooseModel>, Error>} - The
   * updated content model(s).
   */
  update(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    res.setHeader('Content-Type', 'application/json')
    return this.service.update(req.params.id, req.body)
      .then(content => res.send(content))
      .catch(err => next(err))
  }

  /**
   * Delete one or multiple content models.
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Promise<MongooseModel|Array<MongooseModel>, Error>} - The
   * deleted content model(s).
   */
  remove(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    res.setHeader('Content-Type', 'application/json')
    return this.service.remove(req.params.id)
      .then(content => res.send(content))
      .catch(err => next(err))
  }

  /**
   * Get a random content model.
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Promise<MongooseModel, Error>} - A random content model.
   */
  random(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    return this.service.random()
      .then(content => this.checkEmptyContent(res, content))
      .catch(err => next(err))
  }

}
