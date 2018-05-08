// Import the necessary modules.
// @flow
/* eslint-disable no-unused-expressions */
import sinon from 'sinon'
import { expect } from 'chai'

import {
  Cli,
  PopApi
} from '../../src'
import {
  name,
  version
} from '../../package'

/** @test {Cli} */
describe('Cli', () => {
  /**
   * The Cli object to test
   * @type {Cli}
   */
  let cli: Cli

  /**
   * Stub for `console.error'
   * @type {Object}
   */
  let error: Object

  /**
   * Stub for `console.info'
   * @type {Object}
   */
  let info: Object

  /**
   * Stub for `process.exit'
   * @type {Object}
   */
  let exit: Object

  /**
   * Hook for setting up the Cli tests.
   * @type {Function}
   */
  before(() => {
    exit = sinon.stub(process, 'exit')
    error = sinon.stub(console, 'error')
    info = sinon.stub(console, 'info')

    cli = new Cli(PopApi, {
      argv: ['', '', '-m', 'pretty'],
      name,
      version
    })
  })

  /** @test {Cli#constructor} */
  it('should create a new Cli instance without arguments to parse', () => {
    const cli = new Cli(PopApi, {
      name,
      version
    })
    expect(cli).to.be.an('object')

    try {
      new Cli(PopApi, {}) // eslint-disable-line no-new
      expect(true).to.be.false
    } catch (err) {
      expect(err).to.be.an('Error')
      expect(err.message).to.equal(
        '\'name\' and \'version\' are required options for the Cli middleware!'
      )
    }
  })

  /** @test {Cli#constructor} */
  it('should check the attributes of the Cli', () => {
    expect(cli.program).to.exist
    expect(cli.program).to.be.an('object')
    expect(cli.name).to.exist
    expect(cli.name).to.be.a('string')
    expect(cli.version).to.exist
    expect(cli.version).to.be.a('string')
  })

  /** @test {Cli#initOptions} */
  it('should initiate the options for the Cli', () => {
    const val = cli.initOptions(version)
    expect(val).to.be.an('object')
  })

  /** @test {Cli#getHelp} */
  it('should get the help message', () => {
    const val = cli.getHelp()
    expect(val).to.be.an('array')
  })

  /** @test {Cli#printHelp} */
  it('should print the --help option', () => {
    const val = cli.printHelp()
    expect(val).to.be.undefined
  })

  /**
   * Helper function to test the `_mode` method.
   * @param {!string} mode - The mode parameter to test.
   * @returns {void}
   */
  function testMode(mode: string): void {
    /** @test {Cli#mode} */
    it(`should run the --mode option with the '${mode}' option`, () => {
      const val = cli.mode(mode)
      expect(val).to.be.an('object')
    })
  }

  // Execute the test.
  ['ugly', 'pretty'].map(testMode)

  /** @test {Cli#run} */
  it('should invoke no options and print the --help option', () => {
    const stub = sinon.stub(process.stdout, 'write')

    const val = cli.run({}, ['', '', '--help'])
    expect(val).to.be.undefined

    stub.restore()
  })

  /** @test {Cli#run} */
  it('should not parse the arguments since there are none', () => {
    cli.program.mode = null
    const stub = sinon.stub(process.stdout, 'write')

    const val = cli.run()
    expect(val).to.be.undefined

    stub.restore()
  })

  /**
   * Hook for tearing down the Cli tests.
   * @type {Function}
   */
  after(() => {
    error.restore()
    info.restore()
    exit.restore()
  })
})
