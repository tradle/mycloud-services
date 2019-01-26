import AWS from 'aws-sdk'
import promiseProps from 'p-props'
import { create as createSubscriber } from './domain/push-notifications/subscribers'
import { create as createPublisher, RegisterPublisherOpts } from './domain/push-notifications/publishers'
import { create as createUserLogs } from './domain/user-logs'
import { create as createSubscriberDB } from './db/push-notifications/subscribers'
import { create as createPublisherDB } from './db/push-notifications/publishers'
import { createStore as createS3KeyValueStore } from './infra/aws/s3-kv'
import { createClient as createDBClient } from './infra/aws/db'
import { createRegionalClients as createSNSClients } from './infra/aws/sns/regional-clients'
import { createPubSub } from './infra/aws/sns/pub-sub'
import { genTopicArn } from './infra/aws/sns/gen-topic-arn'
import { getServiceOptions as getBaseServiceOptions } from './infra/aws/get-service-options'
import { createPushNotifier } from './infra/push-notifications'
import { createStore as createLogStore } from './db/user-logs/log-store'
import { createTableDefinition } from './config/aws/table-definition'
import { Config, Container, PushNotifier } from './types'
import { createLogger } from './utils/logger'
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
  const sns = new AWS.SNS(getServiceOptions('sns'))
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

  const pubSub = createPubSub({
    regionalClients: createSNSClients(getServiceOptions('sns'))
  })

  const createPublisherTopicName = (opts: RegisterPublisherOpts) =>
    genTopicArn({
      // our accountId
      accountId: config.accountId,
      region: opts.region,
      // publisher accountId
      name: `${opts.accountId}-${opts.permalink}`
    })

  const parsePublisherTopic = (topic: string) => {
    const name = topic.split(':').pop()
    const [accountId, permalink] = name.split('-')
    return { accountId, permalink }
  }

  const s3ConfBucket = createS3KeyValueStore({
    client: s3,
    prefix: config.s3PushConfBucket
  })

  const pushNotifierPromise = s3ConfBucket.get(config.s3PushConfKey).then(conf => createPushNotifier(conf))
  const container: Container = {
    db,
    createPublisherTopicName,
    parsePublisherTopic,
    pubSub,
    // ts hack
    // this requires promiseProps(container) to be run before container is used
    pushNotifier: (pushNotifierPromise as unknown) as PushNotifier,
    config,
    logger,
    models,
    publisherDB: null,
    subscriberDB: null,
    subscriber: null,
    publisher: null,
    userLogs: null,
    containerMiddleware: null,
    ready: null
  }

  const logStore = createLogStore(keyValueStore)
  container.userLogs = createUserLogs({ store: logStore })

  container.publisherDB = createPublisherDB(container)
  container.publisher = createPublisher(container)
  container.subscriberDB = createSubscriberDB(container)
  container.subscriber = createSubscriber(container)

  container.containerMiddleware = createContainerMiddleware(container)
  container.ready = promiseProps(container).then(resolved => {
    Object.assign(container, resolved)
  })

  return container
}
