// Import the necessary modules.
// @flow
import statusCodes from './statusCodes'

/**
 * Error class for the Api.
 * @extends {Error}
 * @type {ApiError}
 */
export default class ApiError extends Error {

  /**
   * The name of the error
   * @type {string}
   */
  name: string

  /**
   * The message of the error
   * @type {string}
   */
  message: string

  /**
   * The status of the error
   * @type {string}
   */
  status: string

  /**
   * Whenever the error is public or not.
   * @type {boolean}
   */
  isPublic: boolean

  /**
   * Whenever the error is operational or not
   * @type {boolean}
   */
  isOperational: boolean

  /**
   * Create a new ApiError object.
   * @param {!Object} options - The options for the ApiError.
   * @param {!string} options.message - The message of the error.
   * @param {!string} options.status=500 - The status code of the error.
   * @param {!boolean} options.isPublic=false - Whenever the error is public or
   * not.
   */
  constructor({
    message,
    status = statusCodes.INTERNAL_SERVER_ERROR,
    isPublic = false
  }: Object): void {
    super(message)

    /**
     * The name of the error
     * @type {string}
     */
    this.name = this.constructor.name
    /**
     * The message of the error
     * @type {string}
     */
    this.message = message
    /**
     * The status of the error
     * @type {string}
     */
    this.status = status
    /**
     * Whenever the error is public or not.
     * @type {boolean}
     */
    this.isPublic = isPublic
    /**
     * Whenever the error is operational or not
     * @type {boolean}
     */
    this.isOperational = true

    Error.captureStackTrace(this, ApiError)
  }

}
