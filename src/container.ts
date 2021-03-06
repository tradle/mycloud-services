import promiseProps from 'p-props'
import omit from 'lodash/omit'
import AWS from 'aws-sdk'
import { createClient as createSNSClient } from '@tradle/aws-sns-client'
import { createClient as createLambdaClient } from '@tradle/aws-lambda-client'
import { createClientFactory } from '@tradle/aws-client-factory'
import { parseS3Path, targetLocalstack } from '@tradle/aws-common-utils'
import { wrapBucket, createClient as createS3Client } from '@tradle/aws-s3-client'
import { create as createSubscriber } from './domain/push-notifications/subscribers'
import { create as createPublisher } from './domain/push-notifications/publishers'
import { create as createUserLogs, UserLogs } from './domain/user-logs'
import { create as createSubscribersDB } from './db/push-notifications/subscribers'
import { create as createPublishersDB } from './db/push-notifications/publishers'
// import { createStore as createS3KeyValueStore } from './infra/aws/s3-kv'
import { createClient as createDBClient } from './infra/aws/db'
import { createPubSub } from './infra/aws/sns/pub-sub'
import { genTopicArn, parsePublisherTopicArn, genPublisherTopicName } from './infra/aws/sns/topic-arn'
import { createPushNotifier } from './infra/push-notifications'
import { createStore as createLogStore } from './db/user-logs/log-store'
import { createTableDefinition } from './config/aws/table-definition'
import { Config, Container, PushNotifier, RegisterPublisherOpts, LogStore } from './types'
import { createLogger } from './utils/logger'
import { createConfigFromEnv, isFunction } from './config'
import { create as createContainerMiddleware } from './entrypoint/http/middleware/container'
import models from './models'
import { FUNCTIONS } from './constants'
export const createContainer = (config: Config = createConfigFromEnv()): Container => {
  const { local, region, s3UserLogsPrefix, myCloudTableName, logLevel } = config
  if (local) {
    targetLocalstack(AWS)
  }

  const clients = createClientFactory({
    AWS,
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

  const s3Client = createS3Client({ client: clients.s3() })
  const parsedUserLogsPath = parseS3Path(s3UserLogsPrefix)
  const kvStoreLogs = wrapBucket({
    client: s3Client,
    bucket: parsedUserLogsPath.bucket,
    prefix: parsedUserLogsPath.key
  }).kvWithGzip()

  const pubSub = createPubSub({
    logger,
    sns: createSNSClient({ clients }),
    lambda: createLambdaClient({ client: clients.lambda() }),
    local: config.local
  })

  const createPublisherTopicName = (opts: RegisterPublisherOpts) =>
    genTopicArn({
      // our accountId
      accountId: config.accountId,
      region: opts.region,
      // publisher accountId
      name: genPublisherTopicName(opts)
    })

  const s3ConfBucket = wrapBucket({
    client: s3Client,
    bucket: config.s3PushConfBucket
  }).jsonKV()

  // TODO: declare each function's deps more explicitly
  let pushNotifierPromise
  let logStore: LogStore
  let userLogs: UserLogs
  if (config.functionName && isFunction(config.functionName, FUNCTIONS.saveUserLog)) {
    pushNotifierPromise = Promise.resolve(null)
    logStore = createLogStore(kvStoreLogs)
    userLogs = createUserLogs({ store: logStore })
  } else {
    const promisePushConf = s3ConfBucket.get(config.s3PushConfKey)
    pushNotifierPromise = promisePushConf.then(
      conf => createPushNotifier(conf),
      err => {
        logger.error('failed to load push notifications conf', err)
        throw err
      }
    )
  }

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

  container.publishersDB = createPublishersDB(container)
  container.publishers = createPublisher(container)
  container.subscribersDB = createSubscribersDB(container)
  container.subscribers = createSubscriber(container)

  container.containerMiddleware = createContainerMiddleware(container)
  container.ready = promiseProps(omit(container, ['ready'])).then(resolved => {
    Object.assign(container, resolved)
  })

  return container
}
