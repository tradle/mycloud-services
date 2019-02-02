require('../../source-map-install')

import path from 'path'
import test from 'blue-tape'
import { createPushNotifier } from './push-notifications'
import { genPNSConfig } from '../config/gen-pns-config'
import { loudAsync } from '../utils/loud-async'

test(
  'PN integration test',
  loudAsync(async t => {
    const pn = createPushNotifier(
      genPNSConfig({
        production: false,
        apn: {
          appId: 'io.tradle.dev.tim',
          cert: path.resolve(__dirname, '../../certs/apn/cert.pem'),
          key: path.resolve(__dirname, '../../certs/apn/key.pem')
        },
        gcm: {
          apiKey: 'gcmKey'
        }
      })
    )

    await pn.notify({
      deviceTokens: ['5d6b4ad9292c77dd2fdf1e45cae68b936dadb49fc43c8453272374c0d23f9501'],
      title: 'hey ho'
    })
  })
)
