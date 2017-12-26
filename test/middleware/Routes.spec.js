// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import express, { type $Application } from 'express'
import sinon from 'sinon'
import supertest from 'supertest'
import winston from 'winston'
import { join } from 'path'

import {
  ContentService,
  Logger,
  Routes,
  PopApi
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
        basePath: 'example',
        service: new ContentService({
          Model: ExampleModel,
          projection: {
            name: 1
          },
          query: {}
        })
      }
    }]

    PopApi.httpLogger = (req, res, next) => next()
    routes = new Routes(PopApi, {
      app,
      controllers
    })
    request = supertest(app)
  })

  /** @test {Routes#constructor} */
  it('should register the routes when creating a new Routes object', () => {
    new Routes(PopApi, { app }) // eslint-disable-line no-new

    try {
      new Routes(PopApi, {}) // eslint-disable-line no-new
      expect(true).to.be.false
    } catch (err) {
      expect(err).to.be.an('Error')
      expect(err.message).to.equal(
        '\'app\' is a required option for the Routes middleware!'
      )
    }
  })

  /** @test {Routes#registerControllers} */
  it('should register a controller', () => {
    const exp = express()
    const registered = routes.registerControllers(exp, PopApi, controllers)

    expect(registered).to.be.undefined
  })

  /** @test {Routes#convertErrors} */
  it('should catch a 500 internal server error with a default error', done => {
    request.get('/error')
      .expect(500)
      .then(() => done())
      .catch(done)
  })

  /** @test {Routes#setNotFoundHandler} */
  it('should catch a 404 not found error', done => {
    request.get('/not-found')
      .expect(404)
      .then(() => done())
      .catch(done)
  })

  /**
   * Helper function for the 'setErrorHandler' method.
   * @param {!string} env - The value for the NODE_ENV stub.
   * @returns {undefined}
   */
  function testErrorHandler(env: string): void {
    /** @test {Routes#setErrorHandler} */
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

  /** @test {Routes#removeServerHeader} */
  it('should remove the security headers', done => {
    request.get('/hello/world')
      .expect(200)
      .expect(res => {
        expect(res.headers['server']).to.be.undefined
      })
      .then(() => done())
      .catch(done)
  })

  /** @test {Routes#preRoutes} */
  it('should add the security headers', done => {
    request.get('/hello/world')
      .expect(200)
      .expect('X-Content-Type-Options', 'nosniff')
      .expect('Content-Security-Policy', 'default-src \'none\'')
      .expect('X-Frame-Options', 'SAMEORIGIN')
      .expect('X-DNS-Prefetch-Control', 'off')
      .expect('X-Download-Options', 'noopen')
      .expect('X-XSS-Protection', '1; mode=block')
      .expect(res => {
        expect(res.headers['strict-transport-security']).to.be.a('string')
        expect(res.headers['x-powered-by']).to.be.undefined
        expect(res.headers['x-aspnet-version']).to.be.undefined
      })
      .then(() => done())
      .catch(done)
  })

  /** @test {Routes#preRoutes} */
  it('should execute the pre routes hook', () => {
    const res = routes.preRoutes(express())
    expect(res).to.be.undefined
  })

  /** @test {Routes#postRoutes} */
  it('should execute the post routes hook', () => {
    const res = routes.postRoutes(express())
    expect(res).to.be.undefined
  })

  /** @test {Routes#setupRoutes} */
  it('should setup the Express instance', () => {
    const exp = express()
    new Logger(PopApi, { // eslint-disable-line no-new
      name,
      logDir: join(...[
        __dirname,
        '..',
        '..',
        'tmp'
      ])
    })

    routes.setupRoutes(exp, PopApi)
    expect(express).to.not.equal(express())

    winston.loggers.close()
    Logger.fileTransport = null
  })

  /** @test {Routes#setupRoutes} */
  it('should setup the Express instance', () => {
    const exp = express()
    routes.setupRoutes(exp)
    expect(express).to.not.equal(express())
  })
})
