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
   * The service of the content controller.
   * @type {ContentService}
   */
  _service: ContentService

  /**
   * Create a new base content controller.
   * @param {!Object} options - The options for the base content controller.
   * @param {!ContentService} options.service - The service for the content
   * controller.
   */
  constructor({service}: Object): void {
    super()

    /**
     * The service of the content controller.
     * @type {ContentService}
     */
    this._service = service
  }

  /**
   * Default method to register the routes.
   * @param {!Object} router - The express router to register the routes to.
   * @param {?PopApi} [PopApi] - The PopApi instance.
   * @returns {undefined}
   */
  registerRoutes(router: any, PopApi?: any): void {
    const t = this._service.basePath

    router.get(`/${t}s`, this.getContents.bind(this))
    router.get(`/${t}s/:page`, this.getPage.bind(this))
    router.get(`/${t}/:id`, this.getContent.bind(this))
    router.post(`/${t}s`, this.createContent.bind(this))
    router.put(`/${t}/:id`, this.updateContent.bind(this))
    router.delete(`/${t}/:id`, this.deleteContent.bind(this))
    router.get(`/random/${t}`, this.getRandomContent.bind(this))
  }

  /**
   * Check if the content is empty or the length of the content array is zero.
   * @param {!Object} res - The ExpressJS response object.
   * @param {!Object|Array<Object>} content - The content to check.
   * @returns {Object} - Returns a 204 response if the content is empty, or a
   * 200 response with the content if it is not empty.
   */
  _checkEmptyContent(res: $Response, content: any): Object {
    if (!content || content.length === 0) {
      return res.status(204).json()
    }

    return res.json(content)
  }

  /**
   * Get all the available pages.
   * @param {!Object} req - The ExpressJS request object.
   * @param {!Object} res - The ExpressJS response object.
   * @param {!Function} next - The ExpressJS next function.
   * @returns {Promise<Array<string>, Error>} - A list of pages which are
   * available.
   */
  getContents(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<Array<string> | mixed> {
    return this._service.getContents()
      .then(content => this._checkEmptyContent(res, content))
      .catch(err => next(err))
  }

  /**
   * Default method to sort the items.
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
   * @param {!Object} req - The ExpressJS request object.
   * @param {!Object} res - The ExpressJS response object.
   * @param {!Function} next - The ExpressJS next function.
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

    return this._service.getPage(s, Number(page))
      .then(content => this._checkEmptyContent(res, content))
      .catch(err => next(err))
  }

  /**
   * Get a content item based on the id.
   * @param {!Object} req - The ExpressJS request object.
   * @param {!Object} res - The ExpressJS response object.
   * @param {!Function} next - The ExpressJS next function.
   * @returns {Promise<Object, Error>} - The details of a single content item.
   */
  getContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    return this._service.getContent(req.params.id)
      .then(content => this._checkEmptyContent(res, content))
      .catch(err => next(err))
  }

  /**
   * Create a new content item.
   * @param {!Object} req - The ExpressJS request object.
   * @param {!Object} res - The ExpressJS response object.
   * @param {!Function} next - The ExpressJS next function.
   * @returns {Promise<Object, Error>} - The created content item.
   */
  createContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    return this._service.createContent(req.body)
      .then(content => res.json(content))
      .catch(err => next(err))
  }

  /**
   * Update the info of one content item.
   * @param {!Object} req - The ExpressJS request object.
   * @param {!Object} res - The ExpressJS response object.
   * @param {!Function} next - The ExpressJS next function.
   * @returns {Promise<Object, Error>} - The updated content item.
   */
  updateContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    return this._service.updateContent(req.params.id, req.body)
      .then(content => res.json(content))
      .catch(err => next(err))
  }

  /**
   * Delete a content item.
   * @param {!Object} req - The ExpressJS request object.
   * @param {!Object} res - The ExpressJS response object.
   * @param {!Function} next - The ExpressJS next function.
   * @returns {Promise<Object, Error>} - The deleted content item
   */
  deleteContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    return this._service.deleteContent(req.params.id)
      .then(content => res.json(content))
      .catch(err => next(err))
  }

  /**
   * Get a random item.
   * @param {!Object} req - The ExpressJS request object.
   * @param {!Object} res - The ExpressJS response object.
   * @param {!Function} next - The ExpressJS next function.
   * @returns {Promise<Object, Error>} - A random item.
   */
  getRandomContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    return this._service.getRandomContent()
      .then(content => this._checkEmptyContent(res, content))
      .catch(err => next(err))
  }

}
