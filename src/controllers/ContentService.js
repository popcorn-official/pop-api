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
   * Create a new ContentService.
   * @param {!Object} options - The options for the content service.
   * @param {!MongooseModel} options.Model - The model of the service.
   * @param {!Object} options.projection=null - The projection of the service.
   * @param {!Object} options.query={} - The query of the service.
   * @param {!number} [options.pageSize=25] - The page size of the service.
   */
  constructor({
    Model,
    projection = null,
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
  }

  /**
   * Get a sort object to sort the content models of one page.
   * @param {!string} sort - The property to sort on.
   * @param {!number} order - The way to sort the property.
   * @returns {Object} - The sort object.
   */
  sort(sort: string, order: number): Object {
    return {
      [sort]: order
    }
  }

  /**
   * Get a list of content models, allows to skip content models with 'page',
   * and sort content models with 'sort' and 'order'.
   * @param {?string} sort - The sort porperty to sort the content models.
   * @param {!number} order - The order to sort the content models.
   * @param {!number} [page=1] - The page of content models to get.
   * @param {!Object} [query=this.query] - A copy of the query object to get
   * the objects.
   * @returns {Promise<Array<MongooseModel>, Error>} - The content models of a
   * page, max depends on 'pageSize'.
   */
  list(
    sort?: string | null,
    order?: order | null = -1,
    page?: number | string = 1,
    query?: Object = {
      ...this.query
    }
  ): Promise<Array<any>> {
    let aggregateQuery = [{
      $match: query
    }]

    if (this.projection) {
      aggregateQuery.push({
        $project: this.projection
      })
    }

    if (sort) {
      aggregateQuery = [{
        $sort: this.sort(sort, order)
      }, ...aggregateQuery]
    }

    if (typeof page === 'string' && page.toLowerCase() === 'all') {
      return this.Model.aggregate(aggregateQuery)
    }

    const offset = (page - 1) * this.pageSize
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
   * @param {?Object} projection - The projection for the content.
   * @returns {Promise<MongooseModel, Error>} - The details of the content.
   */
  get(id: string, projection?: Object): Promise<any> {
    return this.Model.findOne({
      _id: id
    }, projection)
  }

  /**
   * Insert one or multiple content models into the database.
   * @param {!Array<Object>} toCreate - The object or array of content models
   * to create.
   * @returns {Promise<MongooseModel|Array<MongooseModel>, Error>} - The
   * created content model(s).
   */
  create(toCreate: Array<Object>): Promise<Array<any>> {
    if (toCreate instanceof Array) {
      return pMap(toCreate, async obj => {
        const found = await this.Model.findOne({
          _id: obj.slug
        })

        return found
          ? this.update(obj.slug, obj)
          : this.create(obj)
      }, {
        concurrency: 1
      })
    }

    return new this.Model(toCreate).save()
  }

  /**
   * Update one or multiple content models.
   * @param {!string} toUpdate - The id or array of objects of the content to
   * update.
   * @param {!Object} obj - The object to update.
   * @returns {Promise<MongooseModel|Array<MongooseModel>, Error>} - The
   * updated content model(s).
   */
  update(toUpdate: string | Array<Object>, obj?: Object): Promise<any> {
    if (toUpdate instanceof Array) {
      return this.create(toUpdate)
    }

    return this.Model.findOneAndUpdate({
      _id: toUpdate
    }, new this.Model(obj), {
      upsert: true,
      new: true
    })
  }

  /**
   * Delete one or multiple content models.
   * @param {!string|Array<Object>} toDel - The id or array of objects to
   * delete.
   * @returns {Promise<MongooseModel|Array<MongooseModel>, Error>} - The
   * deleted content model(s).
   */
  remove(toDel: string | Array<Object>): Promise<any> {
    if (toDel instanceof Array) {
      return pMap(toDel, obj => this.remove(obj._id))
    }

    return this.Model.findOneAndRemove({
      _id: toDel
    })
  }

  /**
   * Get a random content model.
   * @returns {Promise<MongooseModel, Error>} - A random content model.
   */
  random(): Promise<any> {
    const aggregateQuery = [{
      $match: this.query
    }, {
      $sample: {
        size: 1
      }
    }, {
      $limit: 1
    }]

    if (this.projection) {
      aggregateQuery.push({
        $project: this.projection
      })
    }

    return this.Model.aggregate(aggregateQuery)
      .then(([ res ]) => res)
  }

}
