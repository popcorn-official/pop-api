// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import {
  ApiError,
  statusCodes
} from '../../src'

/** @test {ApiError} */
describe('ApiError', () => {
  /** @test {ApiError#constructor} */
  it('should create a new ApiError', () => {
    const apiError = new ApiError({
      message: 'test message'
    })
    expect(apiError).to.be.an('Error')
  })

  /** @test {ApiError#constructor} */
  it('should create a new ApiError without default parameters', () => {
    const apiError = new ApiError({
      message: 'test message',
      status: statusCodes.NOT_FOUND,
      isPublic: true
    })
    expect(apiError).to.be.an('Error')
  })
})
