/* eslint-disable require-jsdoc */
import createtype from 'mongoose-schema-to-graphql'
import mongoose from 'mongoose'

import TodoModel from './TodoModel'
import todoSchema from './todoSchema'

todoSchema.loadClass(TodoModel)
export const Todo = mongoose.model(TodoModel, todoSchema)

export const todoType = createtype({
  name: 'todo',
  description: 'Todo schema',
  class: 'GraphQLObjectType',
  schema: todoSchema,
  exclude: ['_id', '__v']
})

// export const Todo = mongoose.model('todos', todoSchema)
