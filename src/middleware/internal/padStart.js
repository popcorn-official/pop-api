// @flow
/**
 * Polyfill for String.prototype.padStart.
 * @link https://developer.mozzila.org/en-US/docs/Web/JAvaScript/Refernce/Global_Objects/String/padStart
 * @param {!number} targetLength - The length of the resulting string once the
 * current string had been padded.
 * @param {?string} padString - The string to pad the currnet string with.
 * @returns {string} - A string of the specified length with the pad string
 * applied to the start.
 */
export default function (targetLength: number, padString?: string): string {
  let targetLen: number = targetLength >> 0
  let padStr: string = String(padString || ' ')

  if (this.length > targetLen) {
    return String(this)
  }

  targetLen = targetLen - this.length
  if (targetLen > padStr.length) {
    padStr += padStr.repeat(targetLen / padStr.length)
  }

  return padStr.slice(0, targetLen) + String(this)
}
