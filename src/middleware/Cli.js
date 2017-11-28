// Import the necessary modules.
// @flow
/* eslint-disable no-console */
/**
 * node.js command-line interfaces made easy
 * @external {Command} https://github.com/tj/commander.js
 */
import Command from 'commander'

/**
 * Class The class for the command line interface.
 * @type {Cli}
 */
export default class Cli {

  /**
   * The name of the Cli program.
   * @type {string}
   */
  _name: string

  /**
   * The command line parser to process the Cli inputs.
   * @type {Command}
   */
  program: Object

  /**
   * Create a new Cli object.
   * @param {!PopApi} PopApi - The PopApi instance to bind the cli to.
   * @param {!Object} options - The options for the cli.
   * @param {?Array<string>} options.argv - The arguments to be parsed by
   * commander.
   * @param {!string} options.name - The name of the Cli program.
   * @param {!string} options.version - The version of the Cli program.
   */
  constructor(PopApi: any, {argv, name, version}: Object): void {
    /**
     * The command line parser to process the Cli inputs.
     * @type {Command}
     */
    this.program = Command
    /**
     * The name of the Cli program.
     * @type {string}
     */
    this._name = name

    this.initOptions(version)
    this.program.on('--help', this.printHelp.bind(this))

    if (argv) {
      this._run(PopApi, argv)
    }
  }

  /**
   * Initiate the options for the Cli.
   * @param {!string} version - The version of the Cli program.
   * @returns {undefined}
   */
  initOptions(version: string): void {
    return this.program.version(`${this._name} v${version}`)
      .option(
        '-m, --mode <type>',
        'Run the API in a particular mode.',
        /^(pretty|quiet|ugly)$/i
      )
  }

  /**
   * Get the help message.
   * @returns {Array<string>} - The help message to print.
   */
  getHelp(): Array<string> {
    return [
      '',
      '  Examples:',
      '',
      `    $ ${this._name} -m <pretty|quiet|ugly>`,
      `    $ ${this._name} --mode <pretty|quiet|ugly>`
    ]
  }

  /**
   * Method for displaying the --help option
   * @returns {undefined}
   */
  printHelp(): void {
    console.info(`${this.getHelp().join('\n')}\n`)
  }

  /**
   * Handle the --mode Cli option.
   * @param {?string} [m] - The mode to run the API in.
   * @returns {Object} - The options to pass to the Logger middleware.
   */
  _mode(m?: string): Object {
    const testing = process.env.NODE_ENV === 'test'

    switch (m) {
      case 'quiet':
        return {
          pretty: false,
          quiet: true
        }
      case 'ugly':
        return {
          pretty: false,
          quiet: testing
        }
      case 'pretty':
      default:
        return {
          pretty: !testing,
          quiet: testing
        }
    }
  }

  /**
   * Run the Cli program.
   * @param {!PopApi} PopApi - The PopApi instance to bind the logger to.
   * @param {?Array<string>} argv - The arguments to be parsed by commander.
   * @returns {undefined}
   */
  _run(PopApi: any, argv?: Array<string>): void {
    if (argv) {
      this.program.parse(argv)
    }

    if (this.program.mode) {
      PopApi.loggerArgs = this._mode(this.program.mode)
    } else {
      console.error('\n  error: no valid command given, please check below:')
      return this.program.help()
    }
  }

}
