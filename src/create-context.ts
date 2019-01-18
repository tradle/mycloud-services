
import AWS from 'aws-sdk'
import { createClient as createDB } from './db'
import { getServiceOptions } from './get-cloud-endpoint'
import { CloudEndpointType } from './types'
import { tableDefinition } from './table-definition'

interface CreateContextOpts {
  endpointType: CloudEndpointType
  region?: string
}

export const createContext = ({ region, endpointType }: CreateContextOpts) => {
  const dynamodb = new AWS.DynamoDB(getServiceOptions({ endpointType, service: 'dynamodb' }))
  const docClient = new AWS.DynamoDB.DocumentClient(getServiceOptions({ endpointType, service: 'dynamodb' }))
  const db = createDB({
    dynamodb,
    docClient,
    tableDefinition,
  })
}
