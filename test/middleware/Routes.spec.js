// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import express, { type $Application } from 'express'
import sinon from 'sinon'
import supertest from 'supertest'
import { join } from 'path'

import {
  ContentService,
  Logger,
  Routes
} from '../../src'
import {
  ExampleController,
  ExampleModel
} from '../../examples'
import { name } from '../../package'

/** @test {Routes} */
describe('Routes', () => {
  /**
   * The express instance to test with.
   * @type {Express}
   */
  let app: $Application

  /**
   * The controllers to register.
   * @type {Array<Object>}
   */
  let controllers: Array<Object>

  /**
   * The routes instance to test.
   * @type {Server}
   */
  let routes: Routes

  /**
   * The supertest object to test with.
   * @type {Object}
   */
  let request: Object

  /**
   * Hook for setting up the Routes tests.
   * @type {Function}
   */
  before(() => {
    app = express()
    controllers = [{
      Controller: ExampleController,
      args: {
        service: new ContentService({
          Model: ExampleModel,
          itemType: 'example',
          projection: {
            name: 1
          },
          query: {}
        })
      }
    }]

    routes = new Routes({
      expressLogger(req, res, next) {
        return next()
      }
    }, {
      app,
      controllers
    })
    request = supertest(app)
  })

  /** @test {Routes#constructor} */
  it('should register the routes when creating a new Routes object', () => {
    new Routes({}, { app }) // eslint-disable-line no-new
  })

  /** @test {Routes#_registerControllers} */
  it('should register a controller', () => {
    const exp = express()
    const registered = routes._registerControllers(exp, {}, controllers)

    expect(registered).to.be.undefined
  })

  /** @test {Routes#_convertErrors} */
  it('should catch a 500 internal server error with a default error', done => {
    request.get('/error')
      .expect(500)
      .then(() => done())
      .catch(done)
  })

  /** @test {Routes#_setNotFoundHandler} */
  it('should catch a 404 not found error', done => {
    request.get('/not-found')
      .expect(404)
      .then(() => done())
      .catch(done)
  })

  /**
   * Helper function for the '_setErrorHandler' method.
   * @param {!string} env - The value for the NODE_ENV stub.
   * @returns {undefined}
   */
  function testErrorHandler(env: string): void {
    /** @test {Routes#_setErrorHandler} */
    it('should catch a 500 internal server error with a custom error', done => {
      const stub = sinon.stub(process, 'env')
      stub.value({
        NODE_ENV: env
      })

      request.get('/custom-error')
        .expect(500)
        .then(() => {
          stub.restore()
          done()
        })
        .catch(done)
    })
  }

  // Execute the tests.
  ['development', 'test'].map(testErrorHandler)

  /** @test {Routes#_addSecHeaders} */
  it('should add the security headers', done => {
    request.get('/hello/world')
      .expect(200)
      .expect('X-Content-Type-Options', 'no-sniff')
      .expect('X-Frame-Options', 'deny')
      .expect('Content-Security-Policy', 'default-src: \'none\'')
      .then(() => done())
      .catch(done)
  })

  /** @test {Routes#_removeSecHeaders} */
  it('should remove the security headers', done => {
    request.get('/hello/world')
      .expect(200)
      .expect(res => {
        expect(res.headers['x-powered-by']).to.be.undefined
        expect(res.headers['x-aspnet-version']).to.be.undefined
        expect(res.headers['server']).to.be.undefined
      })
      .then(() => done())
      .catch(done)
  })

  /** @test {Routes#_preRoutes} */
  it('should execute the pre routes hook', () => {
    const res = routes._preRoutes(express())
    expect(res).to.be.undefined
  })

  /** @test {Routes#_postRoutes} */
  it('should execute the post routes hook', () => {
    const res = routes._postRoutes(express())
    expect(res).to.be.undefined
  })

  /** @test {Routes#_setupRoutes} */
  it('should setup the Express instance', () => {
    const exp = express()
    const PopApi = {}
    new Logger(PopApi, { // eslint-disable-line no-new
      name,
      logDir: join(...[
        __dirname,
        '..',
        '..',
        'tmp'
      ]),
      type: 'express'
    })

    routes._setupRoutes(exp, PopApi)
    expect(express).to.not.equal(express())
  })

  /** @test {Routes#_setupRoutes} */
  it('should setup the Express instance', () => {
    const exp = express()
    routes._setupRoutes(exp)
    expect(express).to.not.equal(express())
  })
})
