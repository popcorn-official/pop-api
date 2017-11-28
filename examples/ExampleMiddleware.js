// @flow

/**
 * Example middleware to use with PopApi.
 * @type {ExampleMiddleware}
 */
export default class ExampleMiddleware {

  /**
   * The name to greet.
   * @type {string}
   */
  _name: string

  /**
   * Create a new instance of the ExampleMiddleware class.
   * @param {!PopApi} PopApi - The PopApi instance.
   * @param {!Object} options - The options for the ExampleMiddleware.
   * @param {!string} options.name - The name to greet.
   */
  constructor(PopApi: any, {name}: Object): void {
    /**
     * The name to greet.
     * @type {string}
     */
    this._name = name

    // Attach or modify anything from the PopApi instance here.
    PopApi.exampleMiddleware = this._getExampleMiddleware()
  }

  /**
   * Get the example middleware.
   * @returns {string} - A simple greeting.
   */
  _getExampleMiddleware(): string {
    return `Hello, ${this._name}`
  }

}
