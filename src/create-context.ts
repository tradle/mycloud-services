import AWS from 'aws-sdk'
import { createClient as createDB } from './db'
import { createHandle } from './db/handle'
import { createStore as createS3KeyValueStore } from './s3-kv'
import { createStore as createLogStore } from './log-store'
import { getServiceOptions as getBaseServiceOptions } from './get-service-options'
import { createTableDefinition } from './table-definition'
import { DB, Config, Context } from './types'
import { createLogger } from './logger'
import { createConfig } from './config'
import { createClient } from 'http'

export const createContext = (config: Config = createConfig()): Context => {
  const { local, region, s3UserLogPrefix, tableName, logLevel } = config
  const logger = createLogger({
    level: logLevel
  })

  const getServiceOptions = service => ({
    region,
    ...getBaseServiceOptions({ local, service })
  })

  const dynamodbClientOpts = getServiceOptions('dynamodb')
  const dynamodb = new AWS.DynamoDB(dynamodbClientOpts)
  const docClient = new AWS.DynamoDB.DocumentClient(dynamodbClientOpts)
  const tableDefinition = createTableDefinition({
    TableName: config.tableName
  })

  const dbHandle = createHandle({
    dynamodb,
    docClient,
    tableDefinition,
    logger
  })

  const db = createDB(dbHandle)
  const s3 = new AWS.S3(getServiceOptions('s3'))
  const s3KVStore = createS3KeyValueStore({
    client: s3,
    prefix: config.s3UserLogPrefix
  })

  const logStore = createLogStore(s3KVStore)
  return {
    db,
    logStore
  }
}
