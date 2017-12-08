// Import the necessary modules.
// @flow
import type {
  $Response,
  $Request,
  NextFunction
} from 'express'
import type { MongooseModel } from 'mongoose'

import IContentController from './IContentController'
import type ContentService from './ContentService'

/**
 * Base class for getting content from endpoints.
 * @implements {IContentController}
 * @type {BaseContentController}
 */
export default class BaseContentController extends IContentController {

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

    router.get(`/${t}s`, this.getContents.bind(this))
    router.get(`/${t}s/:page`, this.getPage.bind(this))
    router.get(`/${t}/:id`, this.getContent.bind(this))
    router.post(`/${t}s`, this.createContent.bind(this))
    router.put(`/${t}/:id`, this.updateContent.bind(this))
    router.get(`/random/${t}`, this.getRandomContent.bind(this))
    if (typeof router.delete === 'function') {
      router.delete(`/${t}/:id`, this.deleteContent.bind(this))
    } else {
      router.del(`/${t}/:id`, this.deleteContent.bind(this))
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
   * Get all the available pages.
   * @override
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Promise<Array<string>, Error>} - A list of pages which are
   * available.
   */
  getContents(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<Array<string> | mixed> {
    return this.service.getContents(`/${this.basePath}`)
      .then(content => this.checkEmptyContent(res, content))
      .catch(err => next(err))
  }

  /**
   * Default method to sort the items.
   * @override
   * @param {!string} sort - The property to sort on.
   * @param {!number} order - The way to sort the property.
   * @returns {Object} - The sort object.
   */
  sortContent(sort: string, order: number): Object {
    return {
      [sort]: order
    }
  }

  /**
   * Get content from one page.
   * @override
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Promise<Array<Object>, Error>} - The content of one page.
   */
  getPage(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<Array<MongooseModel> | mixed> {
    const { page } = req.params
    const { sort, order } = req.query

    const o = parseInt(order, 10) ? parseInt(order, 10) : -1
    const s = typeof sort === 'string' ? this.sortContent(sort, o) : null

    return this.service.getPage(s, Number(page))
      .then(content => this.checkEmptyContent(res, content))
      .catch(err => next(err))
  }

  /**
   * Get a content item based on the id.
   * @override
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Promise<Object, Error>} - The details of a single content item.
   */
  getContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    return this.service.getContent(req.params.id)
      .then(content => this.checkEmptyContent(res, content))
      .catch(err => next(err))
  }

  /**
   * Create a new content item.
   * @override
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Promise<Object, Error>} - The created content item.
   */
  createContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    res.setHeader('Content-Type', 'application/json')
    return this.service.createContent(req.body)
      .then(content => res.send(content))
      .catch(err => next(err))
  }

  /**
   * Update the info of one content item.
   * @override
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Promise<Object, Error>} - The updated content item.
   */
  updateContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    res.setHeader('Content-Type', 'application/json')
    return this.service.updateContent(req.params.id, req.body)
      .then(content => res.send(content))
      .catch(err => next(err))
  }

  /**
   * Delete a content item.
   * @override
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Promise<Object, Error>} - The deleted content item
   */
  deleteContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    res.setHeader('Content-Type', 'application/json')
    return this.service.deleteContent(req.params.id)
      .then(content => res.send(content))
      .catch(err => next(err))
  }

  /**
   * Get a random item.
   * @override
   * @param {!IncomingMessage} req - The incoming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @returns {Promise<Object, Error>} - A random item.
   */
  getRandomContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    return this.service.getRandomContent()
      .then(content => this.checkEmptyContent(res, content))
      .catch(err => next(err))
  }

}
