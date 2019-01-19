import { DB as DBHandle } from '@tradle/dynamodb'

export { Config } from './config'
export { PushProtocol } from './constants'

export { DBHandle }

export interface TableDefinition extends AWS.DynamoDB.CreateTableInput {}

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
  putUserLog: (key: string, value: string) => Promise<void>
}

export interface Context {
  db: DB
  logStore: LogStore
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

declare namespace Queries {
  export interface CreatePublisherOpts {}
  export type CreatePublisher = (opts: CreatePublisherOpts) => Promise<void>

  export interface CreateSubscriberOpts {}
  export type CreateSubscriber = (opts: CreateSubscriberOpts) => Promise<void>

  export interface CreateSubscriptionOpts {}
  export type CreateSubscription = (opts: CreateSubscriptionOpts) => Promise<void>

  export interface AddSubscriberDeviceOpts {}
  export type AddSubscriberDevice = (opts: AddSubscriberDeviceOpts) => Promise<void>
}

export interface DB {
  createPublisher: Queries.CreatePublisher
  createSubscriber: Queries.CreateSubscriber
  createSubscription: Queries.CreateSubscription
  addSubscriberDevice: Queries.AddSubscriberDevice
}

export { Queries }
