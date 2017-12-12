/* eslint-disable require-jsdoc */
import expressGraphQL from 'express-graphql'
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema
} from 'graphql'
import { IController } from '../src'

import { todo } from './models'

export default class TodoController extends IController {

  constructor({basePath, service}) {
    super()

    this.basePath = basePath
    this.service = [service]
    this.services = [service]
  }

  registerRoutes(router, PopApi) {
    const schema = new GraphQLSchema({
      query: this.getQueryType(),
      mutation: this.getMutationType()
    })

    router.use('/graphql', expressGraphQL({
      schema,
      graphiql: true,
      context: {
        service: this.service
      }
    }))
  }

  list() {
    return {
      type: new GraphQLList(todo.todoType),
      args: {
        sort: {
          name: 'Sort todos',
          type: GraphQLString
        },
        order: {
          name: 'Order todos',
          type: GraphQLInt,
          defaultValue: -1
        },
        page: {
          name: 'Page of todos',
          type: GraphQLInt,
          defaultValue: 1
        }
      },
      resolve(root, {sort, order, page}, {service}) {
        return service.getPage(sort, order, page)
      }
    }
  }

  get() {
    return {
      type: todo.todoType,
      args: {
        id: {
          name: 'Unique id',
          type: GraphQLString
        }
      },
      resolve(root, {id}, {service}) {
        return service.getContent(id)
      }
    }

  }

  create() {
    return {
      type: todo.todoType,
      description: 'Add a Todo',
      args: {
        title: {
          name: 'Todo title',
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve(root, {title}, {service}) {
        return service.createContent({
          title,
          completed: false
        })
      }
    }
  }

  getQueryType() {
    return new GraphQLObjectType({
      name: 'Query',
      fields: {
        [`${this.basePath}s`]: this.list(),
        [this.basePath]: this.get()
      }
    })
  }

  getMutationType() {
    const { basePath } = this
    const cap = `${basePath.charAt(0).toUpperCase()}${basePath.slice(1)}`

    return new GraphQLObjectType({
      name: 'Mutation',
      fields: {
        [`create${cap}`]: this.create()
      }
    })
  }

}
