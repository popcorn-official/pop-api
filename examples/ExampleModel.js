// Import the necessary modules.
// @flow
import mongoose, {
  Model,
  Schema
} from 'mongoose'

/**
 * An example ES6 class for the example schema.
 * @extends {Model}
 * @type {ExampleModel}
 */
class ExampleModel extends Model {

  /**
   * The id of the example model.
   * @type {string}
   */
  _id: string

  /**
   * The slug of the example model.
   * @type {string}
   */
  slug: string

  /**
   * The name of the example model.
   * @type {string}
   */
  name: string

  /**
   * Create a new example model object.
   * @param {!string} slug - The slug of the example model.
   * @param {!string} name - The name of the example model.
   */
  constructor({slug, name}: Object = {}): void {
    super()

    /**
     * The id of the example model.
     * @type {string}
     */
    this._id = slug
    /**
     * The slug of the example model.
     * @type {string}
     */
    this.slug = slug
    /**
     * The name of the example model.
     * @type {string}
     */
    this.name = name
  }

}

/**
 * Example mongoose schema.
 * @type {Schema}
 */
const exampleSchema = new Schema({
  _id: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  slug: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
}, {
  collection: 'examples'
})

// Attach the class to the schema.
exampleSchema.loadClass(ExampleModel)

/**
 * Export the model
 * @type {ExampleModel}
 */
export default mongoose.model(ExampleModel, exampleSchema)
