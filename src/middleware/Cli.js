// Import the necessary modules.
// @flow
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
   * The command line parser to process the Cli inputs.
   * @type {Command}
   */
  program: Object

  /**
   * The name of the Cli program.
   * @type {string}
   */
  name: string

  /**
   * The version of the Cli program.
   * @type {string}
   */
  version: string

  /**
   * Create a new Cli object.
   * @param {!PopApi} PopApi - The PopApi instance to bind the cli to.
   * @param {!Object} options - The options for the cli.
   * @param {?Array<string>} options.argv - The arguments to be parsed by
   * commander.
   * @param {!string} options.name - The name of the Cli program.
   * @param {!string} options.version - The version of the Cli program.
   * @throws {TypeError} - 'name' and 'version' are required options for the Cli
   * middleware!
   */
  constructor(PopApi: any, {argv, name, version}: Object): void {
    const { name: debugName } = this.constructor
    PopApi.debug(`Registering ${debugName} middleware with options: %o`, {
      argv,
      name,
      version
    })

    if (!name || !version) {
      throw new TypeError('\'name\' and \'version\' are required options for the Cli middleware!')
    }

    /**
     * The command line parser to process the Cli inputs.
     * @type {Command}
     */
    this.program = Command
    /**
     * The name of the Cli program.
     * @type {string}
     */
    this.name = name
    /**
     * The version of the Cli program.
     * @type {string}
     */
    this.version = version

    this.initOptions()
    this.program.on('--help', this.printHelp.bind(this))

    if (argv) {
      this.run(PopApi, argv)
    }
  }

  /**
   * Initiate the options for the Cli.
   * @returns {undefined}
   */
  initOptions(): void {
    return this.program.version(`${this.name} v${this.version}`)
      .option(
        '-m, --mode <type>',
        'Run the API in a particular mode.',
        /^(pretty|ugly)$/i
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
      `    $ ${this.name} -m <pretty|ugly>`,
      `    $ ${this.name} --mode <pretty|ugly>`
    ]
  }

  /**
   * Method for displaying the --help option
   * @returns {undefined}
   */
  printHelp(): void {
    // eslint-disable-next-line no-console
    console.info(`${this.getHelp().join('\n')}\n`)
  }

  /**
   * Handle the --mode Cli option.
   * @param {?string} [m] - The mode to run the API in.
   * @returns {Object} - The options to pass to the Logger middleware.
   */
  mode(m?: string): Object {
    const testing = process.env.NODE_ENV === 'test'

    switch (m) {
      case 'ugly':
        return {
          pretty: false
        }
      case 'pretty':
      default:
        return {
          pretty: !testing
        }
    }
  }

  /**
   * Run the Cli program.
   * @param {!PopApi} PopApi - The PopApi instance to bind the logger to.
   * @param {?Array<string>} argv - The arguments to be parsed by commander.
   * @returns {undefined}
   */
  run(PopApi: any, argv?: Array<string>): void {
    if (argv) {
      this.program.parse(argv)
    }

    if (this.program.mode) {
      PopApi.loggerArgs = this.mode(this.program.mode)
    } else {
      // eslint-disable-next-line no-console
      console.error('\n  error: no valid command given, please check below:')
      return this.program.help()
    }
  }

}
