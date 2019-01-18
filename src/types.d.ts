
export { DB } from '@tradle/dynamodb'

export interface TableDefinition extends AWS.CloudFormation.CreateTableInput {}

export interface PublicKey {
  type: string
  pub: string
  fingerprint: string
  [x:string]: string
}

export interface Identity {
  pubkeys: PublicKey[]
  [x:string]: string
}

export interface Context {
  db: DB
}

export enum CloudEndpointType {
  localstack,
  aws
}
