require('../source-map-install')

import { Level } from 'pino'

export interface Config {
  local: boolean
  tableName: string
  // bucket/path/to/userlogs
  s3UserLogPrefix: string
  logLevel: Level | 'silly'
  region: string
  functionName: string
}

const defaults: Partial<Config> = {
  logLevel: 'info',
  region: 'us-east-1'
}

export const createConfig = (env = process.env) => ({
  ...defaults,
  local: !!env.SERVERLESS_OFFLINE,
  tableName: env.TABLE_NAME,
  s3UserLogPrefix: env.S3_USER_LOG_PREFIX,
  logLevel: env.LOG_LEVEL as Level,
  region: env.AWS_REGION,
  functionName: env.AWS_LAMBDA_FUNCTION_NAME
})
