// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import { statusCodes } from '../../src'

/** @test {statusCodes} */
describe('statusCodes', () => {
  /** @test {statusCodes} */
  it('statusCodes should be an object', () => {
    expect(statusCodes).to.be.an('object')
  })
})
