// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import del from 'del'
import { expect } from 'chai'
import { join } from 'path'

import { utils } from '../src'

describe('utils', () => {
  /**
   * The path the to the temporary directory to test.
   * @type {string}
   */
  let tmp: string

  /**
   * Hook for setting up the utils tests.
   * @type {Function}
   */
  before(() => {
    tmp = join(...[
      __dirname,
      '..',
      'tmp'
    ])
    del.sync(tmp)
  })

  /** @test {createTemp} */
  it('should create the temporary directory', done => {
    utils.createTemp(tmp).then(res => {
      expect(res).to.be.a('string')
      done()
    }).catch(done)
  })

  /** @test {createTemp} */
  it('should remove the files from the temporary directory', done => {
    utils.createTemp(tmp).then(res => {
      expect(res).to.be.a('string')
      done()
    }).catch(done)
  })

  /** @test {executeCommand} */
  it('should successfully execute a command', done => {
    utils.executeCommand('git', [
      'rev-parse',
      '--short',
      'HEAD'
    ]).then(res => {
      expect(res).to.be.a('string')
      done()
    }).catch(done)
  })

  /** @test {executeCommand} */
  it('should fail to execute a command', done => {
    utils.executeCommand('gi', [
      'rev-parse',
      '--short',
      'HEAD'
    ]).then(done)
      .catch(err => {
        expect(err).to.be.an('Error')
        done()
      })
  })
})
