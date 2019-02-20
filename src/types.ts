import { DB as DBHandle, Models, Model } from '@tradle/dynamodb'
// import { Level } from 'pino'
import Compose from 'koa-compose'
import Koa from 'koa'
import Router from 'koa-router'
import * as t from 'io-ts'
import { Publishers } from './domain/push-notifications/publishers'
import { Subscribers } from './domain/push-notifications/subscribers'
import { Publishers as PublishersDB } from './db/push-notifications/publishers'
import { Subscribers as SubscribersDB } from './db/push-notifications/subscribers'
import { UserLogs } from './domain/user-logs'
export { PushProtocol } from './constants'
export { DBHandle, Model, Models, PublishersDB, SubscribersDB }
export { ClientFactory } from '@tradle/aws-client-factory'

export interface TableDefinition extends AWS.DynamoDB.CreateTableInput {}

export interface SNSClients {
  [region: string]: AWS.SNS
}

export type AsyncFn = (...args: any[]) => Promise<any | void>

export interface RequestContext extends Koa.Context {
  container: Container
}

// export type Middleware = Koa.Middleware<any, RequestContext>
export type RouterMiddleware = Router.IMiddleware<any, RequestContext>

const LogLevelV = t.union([
  t.literal('fatal'),
  t.literal('error'),
  t.literal('warn'),
  t.literal('info'),
  t.literal('debug'),
  t.literal('trace')
])

export type LogLevel = t.TypeOf<typeof LogLevelV>

const CommonConfig = t.type({
  local: t.boolean,
  usingServerlessOffline: t.boolean,
  production: t.boolean,
  development: t.boolean,
  test: t.boolean,
  env: t.string,
  region: t.string,
  s3UserLogsPrefix: t.string,
  s3PushConfBucket: t.string,
  s3PushConfKey: t.string,
  s3PushConfPath: t.string,
  logLevel: LogLevelV,
  myCloudTableName: t.string
})

const LocalOnlyConfig = t.type({
  // port: t.number
})

const RemoteOnlyConfig = t.partial({
  region: t.string,
  functionName: t.string,
  notifyFunctionName: t.string,
  accountId: t.string
})

export const ConfigV = t.intersection([CommonConfig, LocalOnlyConfig, RemoteOnlyConfig])
export type Config = t.TypeOf<typeof ConfigV>

// export interface Config {
//   local: boolean
//   tableName: string
//   // bucket/path/to/userlogs
//   s3UserLogsPrefix: string
//   logLevel: Level | 'silly'
//   region: string
//   functionName: string
// }

export interface Logger {
  debug: (...args: any[]) => void
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  fatal: (...args: any[]) => void
  trace?: (...args: any[]) => void

  // make @tradle/dynamodb happy
  silly: (...args: any[]) => void
  log: (...args: any[]) => void
}

export const IdentityPubKeyV = t.type({
  type: t.string,
  pub: t.string,
  fingerprint: t.string
})

export const ECPubKeyV = t.strict({
  pub: t.string,
  curve: t.string
})

export type ECPubKey = t.TypeOf<typeof ECPubKeyV>

export interface KeyValueStore {
  put: (key: string, value: any) => Promise<void>
  get: (key: string) => Promise<any>
}

// export interface StoredValue<T> {
//   get: () => Promise<T>
//   set: (value: T) => Promise<void>
// }
// export interface PushConfStore extends StoredValue<PusherOpts> {}

export interface LogStore {
  put: (key: string, value: string) => Promise<void>
}

export interface StringMap {
  [name: string]: string
}

export interface ParsedAPIGatewayEvent {
  query: StringMap
  headers: StringMap
  body: any
}

export const UnsignedTradleObjectV = t.intersection([
  t.strict({
    _t: t.string
  }),
  t.partial({
    _author: t.string,
    _org: t.string,
    _time: t.number
  })
])

export type UnsignedTradleObject = t.TypeOf<typeof UnsignedTradleObjectV>

export const SignedTradleObjectV = t.intersection([
  UnsignedTradleObjectV,
  t.strict({
    _s: t.string
  }),
  t.partial({
    _link: t.string,
    _permalink: t.string,
    _sigPubKey: t.string
  })
])

export type SignedTradleObject = t.TypeOf<typeof SignedTradleObjectV>

export const IdentityV = t.intersection([
  SignedTradleObjectV,
  t.strict({
    pubkeys: t.array(IdentityPubKeyV)
  })
])

export type Identity = t.TypeOf<typeof IdentityV>

// Subscribers

// export interface GetSubcriptionOpts {
//   publisher: string
//   subscriber: string
// }

// export interface Subscription extends UnsignedTradleObject {
//   publisher: string
//   subscriber: string
//   deviceTokens: string[]
//   seq: number
// }

export interface SubscribersOpts {
  subscribersDB: SubscribersDB
}

export const DeviceV = t.type({
  token: t.string,
  protocol: t.keyof({
    apns: true,
    gcm: true
  })
  // protocol: t.keyof(
  //   PUSH_PROTOCOLS.reduce((obj, name) => {
  //     obj[name] = true
  //     return obj
  //   }, {})
  // )
})

export type Device = t.TypeOf<typeof DeviceV>

export const AddSubscriberDeviceOptsV = t.intersection([
  DeviceV,
  t.type({
    subscriber: t.string
  })
])

export type AddSubscriberDeviceOpts = t.TypeOf<typeof AddSubscriberDeviceOptsV>
export interface SignedDevice extends SignedTradleObject, Device {
  identity: Identity
}
export interface RegisterDeviceOpts {
  device: SignedDevice
}

export interface Subscription extends SignedTradleObject {
  publisher: string
  subscriber: string
}

export interface CreateSubscriptionOpts {
  subscription: Subscription
}

export interface ClearBadgeOpts extends SignedTradleObject {
  subscriber: string
}

// Publishers

export const RegisterPublisherOptsV = t.strict({
  permalink: t.string,
  accountId: t.string,
  region: t.string
})

export type RegisterPublisherOpts = t.TypeOf<typeof RegisterPublisherOptsV>

export const ConfirmPublisherOptsV = t.strict({
  nonce: t.string,
  salt: t.string,
  sig: t.string
})

export type ConfirmPublisherOpts = t.TypeOf<typeof ConfirmPublisherOptsV>

export const VerifyChallengeResponseOptsV = t.intersection([
  ConfirmPublisherOptsV,
  t.strict({
    key: ECPubKeyV
  })
])

export type VerifyChallengeResponseOpts = t.TypeOf<typeof VerifyChallengeResponseOptsV>

export const NotifyOptsV = t.intersection([
  t.type({
    publisher: t.string,
    subscriber: t.string
  }),
  t.partial({
    seq: t.number
  })
])

export type NotifyOpts = t.TypeOf<typeof NotifyOptsV>

export type CreatePublisherTopicName = (opts: RegisterPublisherOpts) => string

export type ParsePublisherTopic = (topic: string) => RegisterPublisherOpts
export const SubscriberV = t.strict({
  permalink: t.string,
  devices: t.array(DeviceV),
  subscriptions: t.array(t.string)
})

export type Subscriber = t.TypeOf<typeof SubscriberV>

export const SerializedSubscriberV = t.type({
  permalink: t.string,
  devices: t.array(t.string),
  subscriptions: t.string
})

export type SerializedSubscriber = t.TypeOf<typeof SerializedSubscriberV>

// Push Notifier
export const APNV = t.type({
  cert: t.string,
  key: t.string,
  appId: t.string
})
export const GCMV = t.type({
  apiKey: t.string
})
export const PusherOptsV = t.partial({
  production: t.boolean,
  gcm: GCMV,
  apn: APNV
})

export type PusherOpts = t.TypeOf<typeof PusherOptsV>

export const PublishOptsV = t.strict({
  topic: t.string,
  message: t.string
})

export type PublishOpts = t.TypeOf<typeof PublishOptsV>

export const SubscribeOptsV = t.strict({
  topic: t.string,
  target: t.string
})

export type SubscribeOpts = t.TypeOf<typeof SubscribeOptsV>

export const AllowPublishOptsV = t.strict({
  topic: t.string,
  publisherId: t.string
})

export type AllowPublishOpts = t.TypeOf<typeof AllowPublishOptsV>

export interface PubSub {
  publish: (opts: PublishOpts) => Promise<void>
  subscribe: (opts: SubscribeOpts) => Promise<void>
  createTopic?: (topic: string) => Promise<void>
  hasTopic?: (topic: string) => Promise<boolean>
  allowPublish?: (opts: AllowPublishOpts) => Promise<void>
}

export interface PushNotifierNotifyOpts {
  deviceTokens: string[]
  badge?: number
  title?: string
  body?: string
}

type PushNotifierNotify = (opts: PushNotifierNotifyOpts) => Promise<any>

export interface PushNotifier {
  notify: PushNotifierNotify
}

// User Logs

export interface UserLogsOpts {
  store: LogStore
}

export const PutUserLogOptsV = t.intersection([
  t.type({
    firstName: t.string,
    log: t.string
  }),
  t.partial({
    lastName: t.string
  })
])

export type PutUserLogOpts = t.TypeOf<typeof PutUserLogOptsV>

// Container

export interface Container {
  db: DBHandle
  pubSub: PubSub
  pushNotifier: PushNotifier
  notificationsTarget: string
  publishersDB: PublishersDB
  publishers: Publishers
  subscribersDB: SubscribersDB
  subscribers: Subscribers
  createPublisherTopicName: CreatePublisherTopicName
  parsePublisherTopicArn: ParsePublisherTopic
  userLogs: UserLogs
  config: Config
  logger: Logger
  models: Models
  containerMiddleware: Compose.Middleware<Koa.Context>
  // pushConf: PushConfStore
  ready: Promise<void>
}
