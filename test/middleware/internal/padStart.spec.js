// Import the necessary modules.
// @flow
/* eslint-disable no-extend-native */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import { padStart } from '../../../src/middleware/internal'

/** @test {padStart} */
describe('padStart', () => {
  /**
   * Temp holder for the padStart function.
   * @type {Function}
   */
  let tmpPadStart: any

  /**
   * Hook for setting up the padStart tests.
   * @type {Function}
   */
  before(() => {
    tmpPadStart = String.prototype.padStart
    // @flow-ignore
    String.prototype.padStart = padStart
  })

  /** @test {padStart} */
  it('should pad a string', () => {
    let res = 'foo'.padStart(1)
    expect(res.length).to.equal(3)

    res = 'foobar'.padStart(1, 'baz')
    expect(res.length).to.equal(6)

    res = ''.padStart(4, 'baz')
    expect(res.length).to.equal(4)

    res = 'quz'.padStart(4, 'quux')
    expect(res.length).to.equal(4)
  })

  /**
   * Hook for tearing down the padStart tests.
   * @type {Function}
   */
  after(() => {
    // @flow-ignore
    String.prototype.padStart = tmpPadStart
  })
})
