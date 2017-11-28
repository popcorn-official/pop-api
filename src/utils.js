// Import the necessary modules.
// @flow
import del from 'del'
import mkdirp from 'mkdirp'
import { existsSync } from 'fs'
import { spawn } from 'child_process'

/**
 * Create a temporary directory for files for the API.
 * @param {!string} path - The path to the directory to create.
 * @returns {Promise<string, Error>} - The path to the created directory.
 */
export async function createTemp(path: string): Promise<string | Error> {
  if (existsSync(path)) {
    await del([`${path}/**`]).then(([ res ]) => res)
  }

  return new Promise(resolve => {
    mkdirp.sync(path)
    return resolve(path)
  })
}

/**
 * Execute a command from within the root folder.
 * @param {!string} cmd - The command to execute.
 * @param {?Array<string>} args - The arguments passed to the command.
 * @returns {Promise<string, Error>} - The output of the command.
 */
export function executeCommand(
  cmd: string,
  args: Array<string>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const res = spawn(cmd, args)

    res.stdout.on('data', data => resolve(data.toString()))
    res.on('error', reject)
    res.on('close', code => {
      if (code === 0) {
        return resolve()
      }

      const err = new Error(`${cmd} exited with code: ${code}`)
      return reject(err)
    })
  })
}
