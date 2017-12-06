import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import {
  main,
  module,
  dependencies
} from './package.json'

export default {
  input: './src/index.js',
  external: [
    ...Object.keys(dependencies),
    'child_process',
    'cluster',
    'fs',
    'http',
    'os',
    'path'
  ],
  plugins: [
    resolve(),
    babel()
  ],
  interop: false,
  output: [{
    file: main,
    format: 'cjs'
  }, {
    file: module,
    format: 'es'
  }]
}
