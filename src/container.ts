import AWS from 'aws-sdk'
import { create as createSubscriber } from './domain/push-notifications/subscriber'
import { create as createPublisher } from './domain/push-notifications/publisher'
import { create as createUserLogs } from './domain/user-logs'
import { create as createSubscriberDB } from './db/push-notifications/subscriber'
import { create as createPublisherDB } from './db/push-notifications/publisher'
import { createStore as createS3KeyValueStore } from './infra/aws/s3-kv'
import { createClient as createDBClient } from './infra/aws/db'
import { getServiceOptions as getBaseServiceOptions } from './infra/aws/get-service-options'
import { createStore as createLogStore } from './log-store'
import { createTableDefinition } from './config/aws/table-definition'
import { Config, Container } from './types'
import { createLogger } from './logger'
import { createConfig } from './config'
import { create as createContainerMiddleware } from './entrypoint/http/middleware/container'
import models from './models'

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

  const db = createDBClient({
    models,
    dynamodb,
    docClient,
    tableDefinition,
    logger
  })

  const s3 = new AWS.S3(getServiceOptions('s3'))
  const keyValueStore = createS3KeyValueStore({
    client: s3,
    prefix: config.s3UserLogPrefix
  })

  const container: Container = {
    db,
    config,
    logger,
    models,
    publisherDB: null,
    subscriberDB: null,
    subscriber: null,
    publisher: null,
    userLogs: null,
    containerMiddleware: null
  }

  const logStore = createLogStore(keyValueStore)
  container.userLogs = createUserLogs({ store: logStore })

  container.publisherDB = createPublisherDB(container)
  container.publisher = createPublisher(container)
  container.subscriberDB = createSubscriberDB(container)
  container.subscriber = createSubscriber(container)

  container.containerMiddleware = createContainerMiddleware(container)
  return container
}
