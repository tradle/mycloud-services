import fs from 'fs'
import cloneDeep from 'lodash/cloneDeep'
import { PusherOpts, PusherOptsV } from '../types'
import * as assert from '../utils/assert'

// interface GenPNSConfigOpts {
//   production: boolean
//   apn: {
//     cert: string
//     key: string
//   }
//   gcm: {
//     apiKey: string
//   }
// }
export const validatePNSConfig = (opts: PusherOpts) => assert.isTypeOf(opts, PusherOptsV)
export const genPNSConfig = (opts: PusherOpts): PusherOpts => {
  validatePNSConfig(opts)
  opts = cloneDeep(opts)

  const { apn } = opts
  if (apn.cert) {
    apn.cert = fs.readFileSync(apn.cert, 'utf8')
  }

  if (apn.key) {
    apn.key = fs.readFileSync(apn.key, 'utf8')
  }

  return opts
}
