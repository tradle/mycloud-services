import { DB as DBHandle } from '@tradle/dynamodb'
// import { Level } from 'pino'
import Compose from 'koa-compose'
import Koa from 'koa'
import * as t from 'io-ts'
import { Publisher } from './domain/publisher'
import { Subscriber } from './domain/subscriber'
import { UserLogs } from './domain/user-logs'

export { PushProtocol } from './constants'

export { DBHandle }

export interface TableDefinition extends AWS.DynamoDB.CreateTableInput {}
export type AsyncFn = (...args: any[]) => Promise<any | void>

export interface RequestContext extends Koa.Context {
  container: Container
}

export type Middleware = Koa.Middleware<Koa.ParameterizedContext<any, RequestContext>>

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
  s3UserLogPrefix: t.string,
  logLevel: LogLevelV,
  tableName: t.string
})

const LocalOnlyConfig = t.type({
  // port: t.number
})

const RemoteOnlyConfig = t.partial({
  region: t.string,
  functionName: t.string
})

export const ConfigV = t.intersection([CommonConfig, LocalOnlyConfig, RemoteOnlyConfig])
export type Config = t.TypeOf<typeof ConfigV>

// export interface Config {
//   local: boolean
//   tableName: string
//   // bucket/path/to/userlogs
//   s3UserLogPrefix: string
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

export const ECPubKeyV = t.type({
  pub: t.string,
  curve: t.string
})

export type ECPubKey = t.TypeOf<typeof ECPubKeyV>

export interface KeyValueStore {
  put: (key: string, value: any) => Promise<void>
  get: (key: string) => Promise<any>
}

export interface LogStore {
  put: (key: string, value: string) => Promise<void>
}

export interface Container {
  db: DBHandle
  subscriber: Subscriber
  publisher: Publisher
  userLogs: UserLogs
  config: Config
  logger: Logger
  containerMiddleware: Compose.Middleware<Koa.Context>
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
  t.type({
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
  t.type({
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
  t.type({
    pubkeys: t.array(ECPubKeyV)
  })
])

export type Identity = t.TypeOf<typeof IdentityV>
