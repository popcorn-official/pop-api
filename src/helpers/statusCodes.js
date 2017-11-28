// Import the necessary modules.
// @flow
import { STATUS_CODES } from 'http'

/**
 * Swap the key-value pairs from the `http.STATUS_CODES` object.
 * @type {Object}
 */
const statusCodes: {
  [key: string]: number
} = Object.keys(STATUS_CODES).reduce((acc, current) => {
  const code = parseInt(current, 10)
  const message = STATUS_CODES[code]
    .replace(/'/g, '')
    .replace(/\s+/g, '_')
    .toUpperCase()
  acc[message] = code

  return acc
}, {})

/**
 * Export the status codes.
 * @type {Object}
 */
export default statusCodes
