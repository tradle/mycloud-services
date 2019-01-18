
import AWS from 'aws-sdk'
import { createDB, createTable, createModelStore } from '@tradle/dynamodb'
import { Logger } from 'pino'
import { models } from './models'
import { TableDefinition } from './types'

interface CreateClientOpts {
  dynamodb: AWS.DynamoDB
  docClient: AWS.DynamoDB.DocumentClient
  tableDefinition: TableDefinition
  logger: Logger
}

export const createClient = ({
  dynamodb,
  docClient,
  tableDefinition,
  logger
}: CreateClientOpts) => {
  const db = createDB({
    modelStore: createModelStore({ models }),
    tableNames: [tableDefinition.TableName],

    // specify the definition for a particular table
    defineTable: name => createTable({
      docClient,
      tableDefinition,
      derivedProps,
      models,
      // all models in one table in this example
      modelsStored: models,
      // object storage if you have it:
      // objects,

      // define your rules for (dis)allowing potentially expensive table scans
      allowScan: search => true,
      // define your rules for minifying objects
      // if you have additional object storage
      shouldMinify: item => false,
    }),

    // optional
    // @ts-ignore
    logger,
  })

  return db
}
