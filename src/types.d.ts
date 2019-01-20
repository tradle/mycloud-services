import { DB as DBHandle } from '@tradle/dynamodb'
import { Publisher } from './domain/publisher'
import { Subscriber } from './domain/subscriber'
import { UserLogs } from './domain/user-logs'

export { Config } from './config'
export { PushProtocol } from './constants'

export { DBHandle }

export interface TableDefinition extends AWS.DynamoDB.CreateTableInput {}
export type AsyncFn = (...any) => Promise<any | void>

export interface PublicKey {
  pub: string
  curve: string
  // type: string
  // fingerprint: string
  [x: string]: string
}

type PublicKeys = PublicKey[]

export interface KeyValueStore {
  put: (key: string, value: any) => Promise<void>
  get: (key: string) => Promise<any>
}

export interface LogStore {
  put: (key: string, value: string) => Promise<void>
}

export interface Context {
  subscriber: Subscriber
  publisher: Publisher
  userLogs: UserLogs
}

export enum CloudEndpointType {
  localstack,
  aws
}

export type StringMap = { [name: string]: string }

export interface ParsedAPIGatewayEvent {
  query: StringMap
  headers: StringMap
  body: any
}

export interface UnsignedTradleObject {
  _t: string
  _author?: string
  _org?: string
  _time?: number
  [x: string]: any
}

export interface SignedTradleObject extends UnsignedTradleObject {
  _s: string
  _link?: string
  _permalink?: string
  _sigPubKey?: string
}

export interface Identity extends SignedTradleObject {
  pubkeys: PublicKeys
}
