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
      basePath: 'example',
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
    expect(contentService.basePath).to.a('string')
    expect(contentService.basePath).to.equal('example')
  })

  /** @test {ContentService#getPage} */
  it('should get a page of content items', done => {
    contentService.getPage({
      name: -1
    }, 1, {
      name: exampleModel1.name
    }).then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /** @test {ContentService#getPage} */
  it('should get a page of content items', done => {
    contentService.getPage({
      name: -1
    }, 'all').then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /** @test {ContentService#getPage} */
  it('should get a page of content items', done => {
    contentService.getPage({
      name: -1
    }, NaN).then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /** @test {ContentService#getPage} */
  it('should get a page of content items', done => {
    contentService.getPage({
      name: -1
    }).then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /** @test {ContentService#createContent} */
  it('should create a single content item', done => {
    contentService.createContent(exampleModel1).then(res => {
      expect(res).to.be.an('object')
      done()
    }).catch(done)
  })

  /** @test {ContentService#createMany} */
  it('should create multiple content items', done => {
    contentService.createMany([exampleModel2]).then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /** @test {ContentService#getContents} */
  it('should get the available pages', done => {
    contentService.getContents().then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /** @test {ContentService#updateContent} */
  it('should update a single content item', done => {
    const { slug } = exampleModel1
    contentService.updateContent(slug, exampleModel1).then(res => {
      expect(res).to.be.an('object')
      done()
    }).catch(done)
  })

  /** @test {ContentService#updateMany} */
  it('should update multiple content items', done => {
    contentService.updateMany([
      exampleModel1,
      exampleModel2
    ]).then(res => {
      expect(res).to.be.an('array')
      done()
    }).catch(done)
  })

  /** @test {ContentService#getContent} */
  it('should get a single content item', done => {
    contentService.getContent(exampleModel1.slug).then(res => {
      expect(res).to.be.an('object')
      done()
    }).catch(done)
  })

  /** @test {ContentService#getRandomContent} */
  it('should get a single random content item', done => {
    contentService.getRandomContent().then(res => {
      expect(res).to.be.an('object')
      done()
    }).catch(done)
  })

  /** @test {ContentService#deleteContent} */
  it('should delete a single content item', done => {
    contentService.deleteContent(exampleModel1.slug).then(res => {
      expect(res).to.be.an('object')
      done()
    }).catch(done)
  })

  /** @test {ContentService#deleteMany} */
  it('should delete multiple content items', done => {
    contentService.deleteMany([exampleModel2]).then(res => {
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
