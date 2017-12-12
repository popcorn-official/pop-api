/* eslint-disable require-jsdoc */
import { Model } from 'mongoose'

export default class TodoModel extends Model {

  constructor({id, title, completed}) {
    super()

    this._id = id
    this.id = id
    this.title = title
    this.completed = completed
  }

}
