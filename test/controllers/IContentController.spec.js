// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import { IContentController } from '../../src'

/** @test {IContentController} */
describe('IContentController', () => {
  /**
   * The content controller interface to test.
   * @type {string}
   */
  let iContentController: IContentController

  /**
   * Hook for setting up the IContentController tests.
   * @type {Function}
   */
  before(() => {
    iContentController = new IContentController()
  })

  /** @test {IContentController#getContents} */
  it('should throw an error when calling the default getContents method', () => {
    expect(iContentController.getContents)
      .to.throw('Using default method: \'getContents\'')
  })

  /** @test {IContentController#sortContent} */
  it('should throw an error when calling the default sortContent method', () => {
    expect(iContentController.sortContent)
      .to.throw('Using default method: \'sortContent\'')
  })

  /** @test {IContentController#getPage} */
  it('should throw an error when calling the default getPage method', () => {
    expect(iContentController.getPage)
      .to.throw('Using default method: \'getPage\'')
  })

  /** @test {IContentController#getContent} */
  it('should throw an error when calling the default getContent method', () => {
    expect(iContentController.getContent)
      .to.throw('Using default method: \'getContent\'')
  })

  /** @test {IContentController#createContent} */
  it('should throw an error when calling the default createContent method', () => {
    expect(iContentController.createContent)
      .to.throw('Using default method: \'createContent\'')
  })

  /** @test {IContentController#updateContent} */
  it('should throw an error when calling the default updateContent method', () => {
    expect(iContentController.updateContent)
      .to.throw('Using default method: \'updateContent\'')
  })

  /** @test {IContentController#deleteContent} */
  it('should throw an error when calling the default deleteContent method', () => {
    expect(iContentController.deleteContent)
      .to.throw('Using default method: \'deleteContent\'')
  })

  /** @test {IContentController#getRandomContent} */
  it('should throw an error when calling the default getRandomContent method', () => {
    expect(iContentController.getRandomContent)
      .to.throw('Using default method: \'getRandomContent\'')
  })
})
