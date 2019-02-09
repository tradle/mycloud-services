#!/usr/bin/env node

import fs from 'fs'
import uniqueStrict from 'lodash/uniq'
import { listNativeModules } from './list-native-modules'

const { output } = require('minimist')(process.argv.slice(2))
if (!output) throw new Error('expected "output"')

const modules = []
const rethrow = err => {
  if (err) throw err
}

const promiseNative = listNativeModules()

process.stdin
  .on('data', paths => {
    paths
      .toString()
      .split('\n')
      .forEach(filePath => {
        modules.push(filePath.split('node_modules/').pop())
      })
  })
  .on('end', async () => {
    const native = await promiseNative
    const prodNative = uniqueStrict(modules).filter(name => {
      return native.find(str => str === name)
    })

    fs.writeFile(output, prodNative.join(' '), rethrow)
  })

process.on('unhandledRejection', err => {
  process.exitCode = 1
  // tslint:disable-next-line:no-console
  console.error(err.stack)
})
