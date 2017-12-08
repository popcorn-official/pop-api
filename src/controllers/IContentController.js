// Import the necessary modules.
// @flow
import type {
  $Response,
  $Request,
  NextFunction
} from 'express'
import type { MongooseModel } from 'mongoose'

import IController from './IController'

/** @external {IncommingMessage} https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_incomingmessage */
/** @external {ServerResponse} https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_serverresponse */

/**
 * Interface for handling the content endpoints.
 * @interface
 * @type {IContentController}
 * @implements {IController}
 */
export default class IContentController extends IController {

  /**
   * Default method to get content pages.
   * @abstract
   * @param {!IncommingMessage} req - The incomming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @throws {Error} - Using default method: 'getContents'.
   * @returns {Promise<Array<string>, Object>} - A list of pages which are
   * available.
   */
  getContents(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<Array<string> | mixed> {
    throw new Error('Using default method: \'getContents\'')
  }

  /**
   * Default method to sort the items.
   * @abstract
   * @param {!string} sort - The property to sort on.
   * @param {!number} order - The way to sort the property.
   * @throws {Error} - Using default method: 'sortContent'
   * @returns {Object} - The sort object.
   */
  sortContent(sort: string, order: number): Object {
    throw new Error('Using default method: \'sortContent\'')
  }

  /**
   * Default method to get a page of content.
   * @abstract
   * @param {!IncommingMessage} req - The incomming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @throws {Error} - Using default method: 'getPage'.
   * @returns {Promise<Array<Object>, Error>} - The content of one page.
   */
  getPage(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<Array<MongooseModel> | mixed> {
    throw new Error('Using default method: \'getPage\'')
  }

  /**
   * Get a content item based on the id.
   * @abstract
   * @param {!IncommingMessage} req - The incomming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @throws {Error} - Using default method: 'getContent'.
   * @returns {Promise<Object, Error>} - The details of a single content item.
   */
  getContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    throw new Error('Using default method: \'getContent\'')
  }

  /**
   * Create a new content item.
   * @abstract
   * @param {!IncommingMessage} req - The incomming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @throws {Error} - Using default method: 'createContent'.
   * @returns {Promise<Object, Error>} - The created content item.
   */
  createContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    throw new Error('Using default method: \'createContent\'')
  }

  /**
   * Update the info of one content item.
   * @abstract
   * @param {!IncommingMessage} req - The incomming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @throws {Error} - Using default method: 'updateContent'.
   * @returns {Promise<Object, Error>} - The updated content item.
   */
  updateContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    throw new Error('Using default method: \'updateContent\'')
  }

  /**
   * Delete a content item.
   * @abstract
   * @param {!IncommingMessage} req - The incomming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @throws {Error} - Using default method: 'deleteContent'.
   * @returns {Promise<Object, Error>} - The deleted content item
   */
  deleteContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    throw new Error('Using default method: \'deleteContent\'')
  }

  /**
   * Default method to get a random content item.
   * @abstract
   * @param {!IncommingMessage} req - The incomming message request object.
   * @param {!ServerResponse} res - The server response object.
   * @param {!Function} next - The next function to move to the next
   * middleware.
   * @throws {Error} - Using default method: 'getRandomContent'.
   * @returns {Promise<Object, Error>} - A random item.
   */
  getRandomContent(
    req: $Request,
    res: $Response,
    next: NextFunction
  ): Promise<MongooseModel | mixed> {
    throw new Error('Using default method: \'getRandomContent\'')
  }

}
