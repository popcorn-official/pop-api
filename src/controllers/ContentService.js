// Import the necessary modules.
// @flow
import pMap from 'p-map'
/**
 * MongoDB object modeling designed to work in an asynchronous environment.
 * @external {MongooseModel} https://github.com/Automattic/mongoose
 */
import type { MongooseModel } from 'mongoose'

/**
 * ContentService class for the CRUD operations.
 * @type {ContentService}
 */
export default class ContentService {

  /**
   * The model of the service.
   * @type {MongooseModel}
   */
  Model: MongooseModel

  /**
   * The maximum items to display per page.
   * @type {number}
   */
  pageSize: number

  /**
   * Simple projection for showing multiple content items.
   * @type {Object}
   */
  projection: Object

  /**
   * The query of the service.
   * @type {Object}
   */
  query: Object

  /**
   * The base path of the service.
   * @type {string}
   */
  basePath: string

  /**
   * Create a new ContentService.
   * @param {!Object} options - The options for the content service.
   * @param {!MongooseModel} options.Model - The model of the service.
   * @param {!string} options.basePath - The base path of the service.
   * @param {!Object} options.projection - The projection of the service.
   * @param {!Object} options.query={} - The query of the service.
   * @param {!number} [options.pageSize=25] - The page size of the service.
   */
  constructor({
    Model,
    basePath,
    projection,
    query = {},
    pageSize = 25
  }: Object): void {
    /**
     * The item type of the service.
     * @type {MongooseModel}
     */
    this.Model = Model
    /**
     * The maximum items to display per page.
     * @type {number}
     */
    this.pageSize = pageSize
    /**
     * Simple projection for showing multiple content items.
     * @type {Object}
     */
    this.projection = projection
    /**
     * Query to only get the content items.
     * @type {Object}
     */
    this.query = query
    /**
     * The base path of the service.
     * @type {string}
     */
    this.basePath = basePath
  }

  /**
   * Get all the available pages.
   * @param {!string} [base='/'] - The base of the url to display.
   * @returns {Promise<Array<string>, Error>} - A list of pages which are
   * available.
   */
  getContents(base: string = '/'): Promise<Array<string>> {
    return this.Model.count(this.query).then(count => {
      const pages = Math.ceil(count / this.pageSize)
      const docs = []

      for (let i = 1; i < pages + 1; i++) {
        docs.push(`${base}${this.basePath}/${i}`)
      }

      return docs
    })
  }

  /**
   * Get content from one page.
   * @param {?Object} sort - The sort object to sort and order content.
   * @param {!number} [p=1] - The page to get.
   * @param {!Object} [query=this.query] - A copy of the query object to
   * get the objects.
   * @returns {Promise<Array<MongooseModel>, Error>} - The content of one page.
   */
  getPage(
    sort?: Object | null,
    p?: number | string = 1,
    query?: Object = {
      ...this.query
    }
  ): Promise<Array<any>> {
    const page = !isNaN(p) ? Number(p) - 1 : 0
    const offset = page * this.pageSize

    let aggregateQuery = [{
      $match: query
    }, {
      $project: this.projection
    }]

    if (sort) {
      aggregateQuery = [{
        $sort: sort
      }, ...aggregateQuery]
    }

    if (typeof p === 'string' && p.toLowerCase() === 'all') {
      return this.Model.aggregate(aggregateQuery)
    }

    aggregateQuery = [...aggregateQuery, {
      $skip: offset
    }, {
      $limit: this.pageSize
    }]

    return this.Model.aggregate(aggregateQuery)
  }

  /**
   * Get the content from the database with an id.
   * @param {!string} id - The id of the content to get.
   * @param {!Object} projection - The projection for the content.
   * @returns {Promise<MongooseModel, Error>} - The details of the content.
   */
  getContent(id: string, projection?: Object): Promise<any> {
    return this.Model.findOne({
      _id: id
    }, projection)
  }

  /**
   * Insert the content into the database.
   * @param {!Object} obj - The object to insert.
   * @returns {Promise<MongooseModel, Error>} - The created content.
   */
  createContent(obj: Object): Promise<any> {
    return new this.Model(obj).save()
  }

  /**
   * Insert multiple content models into the database.
   * @param {!Array<Object>} arr - The array of content to insert.
   * @returns {Promise<Array<MongooseModel>, Error>} - The inserted content.
   */
  createMany(arr: Array<Object>): Promise<Array<any>> {
    return pMap(arr, async obj => {
      const found = await this.Model.findOne({
        _id: obj.slug
      })

      return found
        ? this.updateContent(obj.slug, obj)
        : this.createContent(obj)
    }, {
      concurrency: 1
    })
  }

  /**
   * Update the content.
   * @param {!string} id - The id of the content to get.
   * @param {!Object} obj - The object to update.
   * @returns {Promise<MongooseModel, Error>} - The updated content.
   */
  updateContent(id: string, obj: Object): Promise<any> {
    return this.Model.findOneAndUpdate({
      _id: id
    }, new this.Model(obj), {
      upsert: true,
      new: true
    })
  }

  /**
   * Update multiple content models into the database.
   * @param {!Array<Object>} arr - The array of content to update.
   * @returns {Promise<Array<MongooseModel>, Error>} - The updated content.
   */
  updateMany(arr: Array<Object>): Promise<Array<any>> {
    return this.createMany(arr)
  }

  /**
   * Delete a content model.
   * @param {!string} id - The id of the content to delete.
   * @returns {Promise<MongooseModel, Error>} - The deleted content.
   */
  deleteContent(id: string): Promise<any> {
    return this.Model.findOneAndRemove({
      _id: id
    })
  }

  /**
   * Delete multiple content models from the database.
   * @param {!Array<Object>} arr - The array of content to delete.
   * @returns {Promise<Array<MongooseModel>, Error>} - The deleted content.
   */
  deleteMany(arr: Array<Object>): Promise<Array<any>> {
    return pMap(arr, obj => this.deleteContent(obj._id))
  }

  /**
   * Get random content.
   * @returns {Promise<MongooseModel, Error>} - Random content.
   */
  getRandomContent(): Promise<any> {
    return this.Model.aggregate([{
      $match: this.query
    }, {
      $project: this.projection
    }, {
      $sample: {
        size: 1
      }
    }, {
      $limit: 1
    }]).then(([ res ]) => res)
  }

}
