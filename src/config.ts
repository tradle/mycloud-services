require('../source-map-install')

import { Level } from 'pino'
import withDefaults from 'lodash/defaults'
import * as assert from '@assert'

export interface Config {
  local: boolean
  tableName: string
  // bucket/path/to/userlogs
  s3UserLogPrefix: string
  logLevel: Level | 'silly'
  region: string
  functionName: string
}

// better use io-ts or something
const ConfigAttrs: assert.AttrTypeMap = {
  local: 'boolean',
  tableName: 'string',
  s3UserLogPrefix: 'string',
  logLevel: 'string',
  region: 'string'
  // functionName: 'string' // optional
}

const defaults: Partial<Config> = {
  logLevel: 'info',
  region: 'us-east-1'
}

export const validate = (config: Config) => {
  assert.requireOptions(config, ConfigAttrs)
}

export const create = (env = process.env) => {
  const config = withDefaults(
    {
      local: !!env.SERVERLESS_OFFLINE,
      tableName: env.TABLE_NAME,
      s3UserLogPrefix: env.S3_USER_LOG_PREFIX,
      logLevel: env.LOG_LEVEL as Level,
      region: env.AWS_REGION,
      functionName: env.AWS_LAMBDA_FUNCTION_NAME
    },
    defaults
  )

  validate(config)
  return config
}
