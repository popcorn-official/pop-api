// Import the necessary modules.
// @flow
import cluster from 'cluster'
/** @external {http~Server} https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_server */
import http from 'http'
import { cpus } from 'os'

import type Database from './Database'

/**
 * Class for starting the API.
 * @type {Server}
 */
export default class HttpServer {

  /**
   * the http server object.
   * @type {http~Server}
   * @see https://nodejs.org/api/http.html#http_http_createserver_requestlistener
   */
  server: Server

  /**
   * The port on which the API will run on. Default is `5000`.
   * @type {number}
   */
  serverPort: number

  /**
   * The amount of workers on the cluster.
   * @type {number}
   */
  workers: number

  /**
   * Create a new Server object.
   * @param {!PopApi} PopApi - The PopApi instance to bind the server to.
   * @param {!Object} options - The options for the server.
   * @param {!Express} options.app - The application instance to create a
   * server for.
   * @param {!number} [options.serverPort=process.env.PORT] - The port the API
   * will run on.
   * @param {!number} [options.workers=2] - The amount of workers to fork.
   */
  constructor(PopApi: any, {
    app,
    serverPort = process.env.PORT,
    workers = 2
  }: Object): void {
    /**
     * The amount of workers on the cluster.
     * @type {number}
     */
    this.server = typeof app === 'function' ? http.createServer(app) : app
    /**
     * The port on which the API will run on. Default is `5000`.
     * @type {number}
     */
    this.serverPort = serverPort || 5000
    /**
     * The amount of workers on the cluster.
     * @type {number}
     */
    this.workers = workers
    this.setupApi(app)

    PopApi.server = this
  }

  /**
   * For the workers.
   * @returns {undefined}
   */
  forkWorkers(): void {
    for (let i = 0; i < Math.min(cpus().length, this.workers); i++) {
      cluster.fork()
    }
  }

  /**
   * Handle the errors for workers.
   * @returns {undefined}
   */
  workersOnExit(): void {
    cluster.on('exit', ({ process }) => {
      const msg = `Worker '${process.pid}' died, spinning up another!`
      logger.error(msg)

      cluster.fork()
    })
  }

  /**
   * Method to setup the cron job.
   * @param {!Express} app - The application instance to create a server for.
   * @returns {undefined}
   */
  setupApi(app: Object): void {
    if (cluster.isMaster) {
      this.forkWorkers()
      this.workersOnExit()

      logger.info(`API started on port: ${this.serverPort}`)
    } else if (cluster.isWorker || this.workers === 0) {
      app.listen(this.serverPort)
    }
  }

  /**
   * Method to stop the API from running.
   * @param {!Database} database - The database connection to close.
   * @param {?Function} [done=() => {}] - Function to exit the API.
   * @returns {undefined}
   */
  closeApi(database: Database, done: Function = () => {}): void {
    this.server.close(() => {
      database.disconnect().then(() => {
        logger.info('Closed out remaining connections.')
        done()
      })
    })
  }

}
