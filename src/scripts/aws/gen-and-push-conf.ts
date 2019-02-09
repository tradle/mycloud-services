import path from 'path'
import { createClientFactory } from '@tradle/aws-client-factory'
import { genPNSConfig } from '../../config/gen-pns-config'
import { PusherOpts, Config } from '../../types'
import { createStore } from '../../infra/aws/s3-kv'
import { createConfigFromEnv } from '../../config'
import { targetLocalstack } from '../../infra/aws/target-localstack'
import { createLogger } from '../../utils/logger'
import { load as loadEnv } from '../../config/load-env'

const { PROJECT_ROOT } = loadEnv()
const APN_CERTS_DIR = path.resolve(PROJECT_ROOT, 'certs/apn')

interface GenAndPushOpts extends PusherOpts {
  config: Config
  pushConf: PusherOpts
}

const genAndPush = async ({ config, pushConf }: GenAndPushOpts) => {
  const clients = createClientFactory({
    defaults: { region: config.region }
  })

  if (config.local) {
    targetLocalstack()
  }

  const conf = genPNSConfig(pushConf)
  const kv = createStore({
    client: clients.s3(),
    prefix: config.s3PushConfBucket
  })

  await kv.put(config.s3PushConfKey, conf)
}

const logger = createLogger()

genAndPush({
  config: createConfigFromEnv(),
  pushConf: {
    production: false,
    apn: {
      appId: 'io.tradle.dev.tim',
      cert: path.resolve(APN_CERTS_DIR, 'cert.pem'),
      key: path.resolve(APN_CERTS_DIR, 'key.pem')
    },
    gcm: {
      apiKey: 'gcmKey'
    }
  }
}).catch(err => {
  // @ts-ignore
  logger.error(err.stack)
  process.exitCode = 1
})
