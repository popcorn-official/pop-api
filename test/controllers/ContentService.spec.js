// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import {
  ContentService,
  Database
} from '../../src'
import {
  ExampleModel,
  exampleModel1,
  exampleModel2
} from '../../examples'
import { name } from '../../package'

/** @test {ContentService} */
describe('ContentService', () => {
  /**
   * The content service to test.
   * @type {ContentService}
   */
  let contentService: ContentService

  /**
   * The database manager to connect to mongodb.
   * @type {Database}
   */
  let database: Database

  /**
   * Hook for setting up the ContentService tests.
   * @type {Function}
   */
  before(done => {
    contentService = new ContentService({
      Model: ExampleModel,
      projection: {
        name: 1
      },
      query: {}
    })

    database = new Database({}, {
      database: name
    })
    database.connect()
      .then(() => done())
      .catch(done)
  })

  /** @test {ContentService#constructor} */
  it('should check the attributes of the ContentService', () => {
    expect(contentService.Model).to.a('function')
    expect(contentService.Model).to.equal(ExampleModel)
    expect(contentService.projection).to.an('object')
    expect(contentService.projection).to.deep.equal({
      name: 1
    })
    expect(contentService.query).to.an('object')
    expect(contentService.query).to.deep.equal({})
    expect(contentService.pageSize).to.a('number')
    expect(contentService.pageSize).to.equal(25)
  })

  /** @test {ContentService#constructor} */
  it('should create a ContentService without a projection', () => {
    contentService = new ContentService({
      Model: ExampleModel
    })
    expect(contentService).to.be.an('object')
  })

  /** @test {ContentService#list} */
  it('should get a list of content models', done => {
    contentService.list('name', -1, 1, {
      name: exampleModel1.name
    }).then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /** @test {ContentService#list} */
  it('should get a list of content models', done => {
    contentService.list('name', -1, 'all').then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /** @test {ContentService#list} */
  it('should get a list of content models', done => {
    contentService.list('name', -1, 1).then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /** @test {ContentService#list} */
  it('should get a list of content models', done => {
    contentService.list('name').then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /** @test {ContentService#create} */
  it('should create a single content model', done => {
    contentService.create(exampleModel1).then(res => {
      expect(res).to.be.an('object')
      done()
    }).catch(done)
  })

  /** @test {ContentService#create} */
  it('should create multiple content models', done => {
    contentService.create([exampleModel2]).then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /** @test {ContentService#update} */
  it('should update a single content model', done => {
    const { slug } = exampleModel1
    contentService.update(slug, exampleModel1).then(res => {
      expect(res).to.be.an('object')
      done()
    }).catch(done)
  })

  /** @test {ContentService#update} */
  it('should update multiple content models', done => {
    contentService.update([
      exampleModel1,
      exampleModel2
    ]).then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /** @test {ContentService#get} */
  it('should get a single content models', done => {
    contentService.get(exampleModel1.slug).then(res => {
      expect(res).to.be.an('object')
      done()
    }).catch(done)
  })

  /** @test {ContentService#random} */
  it('should get a single random content model', done => {
    contentService.random().then(res => {
      expect(res).to.be.an('object')
      done()
    }).catch(done)
  })

  /** @test {ContentService#remove} */
  it('should remove a single content remove', done => {
    contentService.remove(exampleModel1.slug).then(res => {
      expect(res).to.be.an('object')
      done()
    }).catch(done)
  })

  /** @test {ContentService#remove} */
  it('should remove multiple content models', done => {
    contentService.remove([exampleModel2]).then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /**
   * Hook for tearing down the ContentService tests.
   * @type {Function}
   */
  after(done => {
    database.disconnect()
      .then(() => done())
      .catch(done)
  })
})
