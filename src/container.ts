import AWS from 'aws-sdk'
import { createHandle } from './db/handle'
import { create as createSubscriber } from './domain/subscriber'
import { create as createPublisher } from './domain/publisher'
import { create as createUserLogs } from './domain/user-logs'
import { create as createSubscriberDB } from './db/subscriber'
import { create as createPublisherDB } from './db/publisher'
import { createStore as createS3KeyValueStore } from './s3-kv'
import { createStore as createLogStore } from './log-store'
import { getServiceOptions as getBaseServiceOptions } from './get-service-options'
import { createTableDefinition } from './table-definition'
import { Config, Container } from './types'
import { createLogger } from './logger'
import { createConfig } from './config'
import { create as createContainerMiddleware } from './interfaces/http/middleware/container'

export const createContainer = (config: Config = createConfig()): Container => {
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

  const s3 = new AWS.S3(getServiceOptions('s3'))
  const s3KVStore = createS3KeyValueStore({
    client: s3,
    prefix: config.s3UserLogPrefix
  })

  const logStore = createLogStore(s3KVStore)
  const publisher = createPublisher({
    db: createPublisherDB({ db: dbHandle })
  })

  const subscriber = createSubscriber({
    db: createSubscriberDB({ db: dbHandle })
  })

  const userLogs = createUserLogs({ store: logStore })
  const container: Container = {
    db: dbHandle,
    subscriber,
    publisher,
    userLogs,
    config,
    logger,
    containerMiddleware: null
  }

  container.containerMiddleware = createContainerMiddleware(container)
  return container
}
