// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import { IController } from '../../src'

/** @test {IController} */
describe('IController', () => {
  /** @test {IController#registerRoutes} */
  it('should throw an error when calling the default registerRoutes method', () => {
    const iController = new IController()
    expect(iController.registerRoutes)
      .to.throw('Using default method: \'registerRoutes\'')
  })
})
