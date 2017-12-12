/* eslint-disable require-jsdoc */
import { Schema } from 'mongoose'

export default new Schema({
  id: Schema.Types.ObjectId,
  title: String,
  completed: Boolean
}, {
  collection: 'todos',
  versionKey: false
})
