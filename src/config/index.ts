import path from 'path'

require('../source-map-install')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})

import withDefaults from 'lodash/defaults'
import { Config, ConfigV, LogLevel } from '../types'
import * as assert from '../assert'

const defaults: Partial<Config> = {
  logLevel: 'info',
  region: 'us-east-1'
}

export const validateConfig = (config: Config) => assert.isTypeOf(config, ConfigV)
export const createConfig = (env = process.env) => {
  const { NODE_ENV = 'development' } = env
  const config = withDefaults(
    {
      local: !env.AWS_REGION,
      usingServerlessOffline: !!env.SERVERLESS_OFFLINE,
      env: NODE_ENV,
      production: NODE_ENV === 'production',
      development: NODE_ENV === 'development',
      test: NODE_ENV === 'test',
      tableName: env.TABLE_NAME,
      s3UserLogPrefix: env.S3_USER_LOG_PREFIX,
      logLevel: env.LOG_LEVEL as LogLevel,
      region: env.AWS_REGION,
      functionName: env.AWS_LAMBDA_FUNCTION_NAME
    },
    defaults
  ) as Config

  validateConfig(config)
  return config
}

createConfig()
