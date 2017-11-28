// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import bodyParser from 'body-parser'
import { expect } from 'chai'
import express, { type $Application } from 'express'
import sinon from 'sinon'
import supertest from 'supertest'

import {
  BaseContentController,
  ContentService,
  Database
} from '../../src'
import {
  ExampleModel,
  exampleModel1,
  exampleModel2
} from '../../examples'
import { name } from '../../package'

/**
 * The base endpoint to test.
 * @type {string}
 */
const content: string = 'example'

/** @test {BaseContentController} */
describe('BaseContentController', () => {
  /**
   * The base content controller object to test.
   * @type {BaseContentController}
   */
  let baseContentController: BaseContentController

  /**
   * The express instance to test with.
   * @type {Express}
   */
  let app: $Application

  /**
   * The database middleware to connect to the MongoDb instance.
   * @type {Database}
   */
  let database: Database

  /**
   * The supertest object to make requests with.
   * @type {Object}
   */
  let request: Object

  /**
   * The id of the content to get.
   * @type {string}
   */
  let id: string

  /**
   * Hook for setting up the base content controller tests.
   * @type {Function}
   */
  before(done => {
    app = express()
    app.use(bodyParser.urlencoded({
      extended: true
    }))
    app.use(bodyParser.json())

    baseContentController = new BaseContentController({
      service: new ContentService({
        Model: ExampleModel,
        basePath: content,
        projection: {
          name: 1
        }
      })
    })
    baseContentController.registerRoutes(app)
    request = supertest(app)

    database = new Database({}, {
      database: name
    })
    database.connect()
      .then(() => done())
      .catch(done)
  })

  /** @test {BaseContentController#constructor} */
  it('should check the attributes of the BaseContentController', () => {
    expect(baseContentController._service).to.be.an('object')
  })

  /** @test {BaseContentController} */
  describe('with an empty database', () => {
    /**
     * Hook for setting up the AudioController tests.
     * @type {Function}
     */
    before(done => {
      ExampleModel.remove({}).exec()
        .then(() => done())
        .catch(done)
    })

    /**
     * Expect a 204 result from a request.
     * @param {!string} route - The route to test.
     * @returns {undefined}
     */
    function expectNoContent(route: string): void {
      it(`should get a 204 status from the GET [/${route}] route`, done => {
        request.get(route)
          .expect(204)
          .then(() => done())
          .catch(done)
      })
    }

    // Execute the tests.
    [
      `/${content}s`,
      `/${content}/1`,
      `/${content}/id`,
      `/random/${content}`
    ].map(expectNoContent)
  })

  /** @test {BaseContentController} */
  describe('with a filled database', () => {
    /**
     * The query object passed along to the 'getAudios' tests.
     * @type {Object}
     */
    let query: Object

    /**
     * Hook for setting up the AudioController tests.
     * @type {Function}
     */
    before(done => {
      query = {
        order: -1
      }

      done()
    })

    // /**
    //  * Expectations for a ok result.
    //  * @param {!Object} res - The result to test.
    //  * @param {!Function} [done=() => {}] - The done function of Mocha.
    //  * @returns {undefined}
    //  */
    // function expectOk(res: Object, done: Function = () => {}): void {
    //   expect(res).to.have.status(200)
    //   expect(res).to.be.json
    //   expect(res).to.not.redirect
    //
    //   done()
    // }

    /**
     * Expect a 200 result from a request.
     * @param {!Object} request - The request object to test with.
     * @param {!Function} done - The done function of Mocha.
     * @returns {undefined}
     */
    function testOkResponse(request: Object, done: Function): void {
      request.expect(200)
        .set('Content', 'application/json')
        .then(() => done())
        .catch(done)
    }

    /** @test {BaseContentController#createContent} */
    it(`should get a 200 status from the POST [/${content}s] route`, done => {
      const req = request.post(`/${content}s`)
        .send(exampleModel1)
      testOkResponse(req, done)
    })

    /** @test {BaseContentController#getContents} */
    it(`should get a 200 status from the GET [/${content}s] route`, done => {
      const req = request.get(`/${content}s`)
      testOkResponse(req, done)
    })

    /** @test {BaseContentController#getPage} */
    it(`should get a 200 status from the GET [/${content}s/:page] route`, done => {
      const req = request.get(`/${content}s/1`).query({
        ...query,
        sort: 'name'
      })
      testOkResponse(req, done)
    })

    /** @test {BaseContentController#getPage} */
    it(`should get a 200 status from the GET [/${content}s/:page] route`, done => {
      request.get(`/${content}s/1`).query({
        ...query
      }).expect(200)
        .then(res => {
          const random = Math.floor(Math.random() * res.body.length)
          id = res.body[random]._id

          done()
        }).catch(done)
    })

    /** @test {BaseContentController#updateContent} */
    it(`should get a 200 status from the PUT [/${content}/:id] route`, done => {
      const { name } = exampleModel2
      const req = request.put(`/${content}/${id}`)
        .send({ name })

      testOkResponse(req, done)
    })

    /** @test {BaseContentController#getContent} */
    it(`should get a 200 status from the GET [/${content}/:id] route`, done => {
      const req = request.get(`/${content}/${id}`)
      testOkResponse(req, done)
    })

    /** @test {BaseContentController#getRandomContent} */
    it(`should get a 200 status from the GET [/random/${content}] route`, done => {
      const req = request.get(`/random/${content}`)
      testOkResponse(req, done)
    })

    /** @test {BaseContentController#deleteContent} */
    it(`should get a 200 status from the DELETE [/${content}/:id] route`, done => {
      const req = request.delete(`/${content}/${id}`)
      testOkResponse(req, done)
    })
  })

  /** @test {BaseContentController} */
  describe('will throw errors', () => {
    /**
     * Expect a 500 result from a request.
     * @param {!Object} request - The request object to test with.
     * @param {!Function} done - The done function of Mocha.
     * @param {!Object} stub - The stub which made the internal server error.
     * @returns {undefined}
     */
    function testInternalServerError(
      request: Object,
      done: Function,
      stub: Object | null = null
    ): void {
      request.expect(500)
        .set('Content', 'application/json')
        .then(() => {
          if (stub) {
            stub.restore()
          }

          done()
        })
        .catch(done)
    }

    /** @test {BaseContentController#createContent} */
    it(`should get a 500 status from the POST [/${content}/:id] route`, done => {
      const req = request.post(`/${content}s`)
      testInternalServerError(req, done)
    })

    /** @test {BaseContentController#getContents} */
    it(`should get a 500 status from the GET [/${content}s] route`, done => {
      const stub = sinon.stub(ExampleModel, 'count')
      stub.rejects()

      const req = request.get(`/${content}s`)
      testInternalServerError(req, done, stub)
    })

    /** @test {BaseContentController#getPage} */
    it(`should get a 500 status from the GET [/${content}s/:page] route`, done => {
      const stub = sinon.stub(ExampleModel, 'aggregate')
      stub.rejects()

      const req = request.get(`/${content}s/1`)
      testInternalServerError(req, done, stub)
    })

    /** @test {BaseContentController#updateContent} */
    it(`should get a 500 status from the PUT [/${content}s] route`, done => {
      const stub = sinon.stub(ExampleModel, 'findOneAndUpdate')
      stub.rejects()

      const req = request.put(`/${content}/${id}`)
      testInternalServerError(req, done, stub)
    })

    /** @test {BaseContentController#getContent} */
    it(`should get a 500 status from the GET [/${content}/:id] route`, done => {
      const stub = sinon.stub(ExampleModel, 'findOne')
      stub.rejects()

      const req = request.get(`/${content}/${id}`)
      testInternalServerError(req, done, stub)
    })

    /** @test {BaseContentController#getRandomContent} */
    it(`should get a 500 status from the GET [/random/${content}] route`, done => {
      const stub = sinon.stub(ExampleModel, 'aggregate')
      stub.rejects()

      const req = request.get(`/random/${content}`)
      testInternalServerError(req, done, stub)
    })

    /** @test {BaseContentController#deleteContent} */
    it(`should get a 500 status from the DELETE [/${content}/:id] route`, done => {
      const stub = sinon.stub(ExampleModel, 'findOneAndRemove')
      stub.rejects()

      const req = request.delete(`/${content}/${id}`)
      testInternalServerError(req, done, stub)
    })
  })

  /**
   * Hook for tearing down the AudioController tests.
   * @type {Function}
   */
  after(done => {
    ExampleModel.findOneAndRemove({
      _id: exampleModel1._id
    }).exec()
      .then(() => database.disconnect())
      .then(() => done())
      .catch(done)
  })
})
