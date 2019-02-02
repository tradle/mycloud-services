import promiseProps from 'p-props'
import { createClientFactory, services } from '@tradle/aws-combo'
import { create as createSubscriber } from './domain/push-notifications/subscribers'
import { create as createPublisher } from './domain/push-notifications/publishers'
import { create as createUserLogs } from './domain/user-logs'
import { create as createSubscriberDB } from './db/push-notifications/subscribers'
import { create as createPublisherDB } from './db/push-notifications/publishers'
import { createStore as createS3KeyValueStore } from './infra/aws/s3-kv'
import { createClient as createDBClient } from './infra/aws/db'
import { createPubSub } from './infra/aws/sns/pub-sub'
import { genTopicArn, parsePublisherTopicArn, genPublisherTopicName } from './infra/aws/sns/topic-arn'
import { targetLocalstack } from './infra/aws/target-localstack'
import { createPushNotifier } from './infra/push-notifications'
import { createStore as createLogStore } from './db/user-logs/log-store'
import { createTableDefinition } from './config/aws/table-definition'
import { Config, Container, PushNotifier, RegisterPublisherOpts } from './types'
import { createLogger } from './utils/logger'
import { createConfigFromEnv } from './config'
import { create as createContainerMiddleware } from './entrypoint/http/middleware/container'
import models from './models'
export const createContainer = (config: Config = createConfigFromEnv()): Container => {
  const { local, region, s3UserLogsPrefix, myCloudTableName, logLevel } = config
  if (local) {
    targetLocalstack()
  }

  const clients = createClientFactory({
    defaults: { region },
    useGlobalConfigClock: true
  })

  const logger = createLogger({
    level: logLevel
  })

  const dynamodb = clients.dynamodb()
  const docClient = clients.documentclient()
  const tableDefinition = createTableDefinition({
    TableName: myCloudTableName
  })

  const db = createDBClient({
    models,
    dynamodb,
    docClient,
    tableDefinition,
    logger
  })

  const s3 = clients.s3()
  const keyValueStore = createS3KeyValueStore({
    client: s3,
    prefix: s3UserLogsPrefix
  })

  const pubSub = createPubSub({
    sns: services.sns({ clients })
  })

  const createPublisherTopicName = (opts: RegisterPublisherOpts) =>
    genTopicArn({
      // our accountId
      accountId: config.accountId,
      region: opts.region,
      // publisher accountId
      name: genPublisherTopicName(opts)
    })

  const s3ConfBucket = createS3KeyValueStore({
    client: s3,
    prefix: config.s3PushConfBucket
  })

  const pushNotifierPromise = s3ConfBucket.get(config.s3PushConfKey).then(
    conf => createPushNotifier(conf),
    err => {
      logger.error('failed to load push notifications conf', err)
      throw err
    }
  )

  const logStore = createLogStore(keyValueStore)
  const userLogs = createUserLogs({ store: logStore })
  const container: Container = {
    db,
    createPublisherTopicName,
    parsePublisherTopicArn,
    pubSub,
    // ts hack
    // this requires promiseProps(container) to be run before container is used
    pushNotifier: (pushNotifierPromise as unknown) as PushNotifier,
    notificationsTarget: `arn:aws:lambda:${config.region}:${config.accountId}:function:${config.notifyFunctionName}`,
    config,
    logger,
    models,
    publishersDB: null,
    subscribersDB: null,
    subscribers: null,
    publishers: null,
    userLogs,
    containerMiddleware: null,
    ready: null
  }

  container.publishersDB = createPublisherDB(container)
  container.publishers = createPublisher(container)
  container.subscribersDB = createSubscriberDB(container)
  container.subscribers = createSubscriber(container)

  container.containerMiddleware = createContainerMiddleware(container)
  container.ready = promiseProps(container).then(resolved => {
    Object.assign(container, resolved)
  })

  return container
}
