require('../../source-map-install')

import withDefaults from 'lodash/defaults'
import { parseS3Path, parseArn } from '@tradle/aws-common-utils'
import { Config, ConfigV, LogLevel } from '../types'
import * as assert from '../utils/assert'
import { load as loadEnv } from './load-env'

const ENV = loadEnv()

const defaults: Partial<Config> = {
  logLevel: 'info',
  region: 'us-east-1'
}

export const validateConfig = (config: Config) => assert.isTypeOf(config, ConfigV)
export const createConfig = (env: any) => {
  const usingServerlessOffline = !!env.IS_OFFLINE
  const local = !!(usingServerlessOffline || env.IS_LOCAL)
  if (local) {
    env = {
      ...env,
      NOTIFY_LAMBDA_FUNCTION: 'mycloud-services-offline-notify-lambda',
      // otherwise we get Ref objects from serverless.yml
      ...ENV
    }
  }

  const s3PushConfPath = env.S3_PUSH_CONF_PATH
  const { bucket, key } = parseS3Path(s3PushConfPath)
  const s3PushConfBucket = bucket
  const s3PushConfKey = key
  const { NODE_ENV = 'development' } = env
  const functionName = env.AWS_LAMBDA_FUNCTION_NAME
  const accountId = env.ACCOUNT_ID || (functionName && parseArn(env.AWS_LAMBDA_FUNCTION_NAME).accountId)
  const config = withDefaults(
    {
      local,
      usingServerlessOffline,
      env: NODE_ENV,
      production: NODE_ENV === 'production',
      development: NODE_ENV === 'development',
      test: NODE_ENV === 'test',
      myCloudTableName: env.MY_CLOUD_TABLE_NAME,
      s3UserLogsPrefix: env.S3_USER_LOGS_PREFIX,
      s3PushConfPath,
      s3PushConfBucket,
      s3PushConfKey,
      logLevel: env.LOG_LEVEL as LogLevel,
      region: env.AWS_REGION,
      functionName,
      accountId,
      notifyFunctionName: env.NOTIFY_LAMBDA_FUNCTION
    } as Config,
    defaults
  ) as Config

  validateConfig(config)
  return config
}

export const createConfigFromEnv = () => createConfig(process.env)

// export const local = (env=process.env) => ({
//   s3PushConfPath: 'tdl-tradle-ltd-dev-privateconf/services/pns.json',
//   s3UserLogPrefix: 'tdl-tradle-ltd-dev-logs/userlogs',
//   mycloudTableArn: 'aws:arn:dynamodb:us-east-1:1234512345:table/tdl-tradle-ltd-dev-bucket-0'
// })

// export const remote = () => ({
//   s3PushConfPath: 'tdl-tradle-ltd-dev-privateconf/services/pns.json',
//   s3UserLogPrefix: 'tdl-tradle-ltd-dev-logs/userlogs',
//   mycloudTableArn: 'aws:arn:dynamodb:us-east-1:1234512345:table/tdl-tradle-ltd-dev-bucket-0'
// })

// export const getVars = () => (process.env.IS_OFFLINE ? local() : remote())
