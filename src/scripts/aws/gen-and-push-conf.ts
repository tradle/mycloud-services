import path from 'path'
import { createClientFactory } from '@tradle/aws-client-factory'
import { createClient as createS3Client, wrapBucket } from '@tradle/aws-s3-client'
import { targetLocalstack } from '@tradle/aws-common-utils'
import { genPNSConfig } from '../../config/gen-pns-config'
import { PusherOpts, Config } from '../../types'
import { createConfigFromEnv } from '../../config'
import { createLogger } from '../../utils/logger'
import { load as loadEnv } from '../../config/load-env'

const { PROJECT_ROOT } = loadEnv()
// const APN_CERTS_DIR = path.resolve(PROJECT_ROOT, 'certs/apn')

const { APN_CERT_PATH, APN_KEY_PATH, FCM_KEY } = process.env

if (!((APN_CERT_PATH && APN_KEY_PATH) || FCM_KEY)) {
  throw new Error('expected APN_CERT_PATH, APN_KEY_PATH, FCM_KEY environment vars')
}

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
  const kv = wrapBucket({
    client: createS3Client({ client: clients.s3() }),
    bucket: config.s3PushConfBucket
  }).jsonKV()

  await kv.put(config.s3PushConfKey, conf)
}

const logger = createLogger()

genAndPush({
  config: createConfigFromEnv(),
  pushConf: {
    production: false,
    apn: APN_CERT_PATH &&
      APN_KEY_PATH && {
        appId: 'io.tradle.dev.tim',
        cert: path.resolve(process.cwd(), APN_CERT_PATH),
        key: path.resolve(process.cwd(), APN_KEY_PATH)
      },
    gcm: FCM_KEY && {
      apiKey: FCM_KEY
    }
  }
}).catch(err => {
  // @ts-ignore
  logger.error(err.stack)
  process.exitCode = 1
})
