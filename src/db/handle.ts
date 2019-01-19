import AWS from 'aws-sdk'
import { createDB, createTable, createModelStore, ILogger } from '@tradle/dynamodb'
import { models } from '../models'
import { TableDefinition } from '../types'

interface CreateHandleOpts {
  dynamodb: AWS.DynamoDB
  docClient: AWS.DynamoDB.DocumentClient
  tableDefinition: TableDefinition
  logger: ILogger
}

export const createHandle = ({ dynamodb, docClient, tableDefinition, logger }: CreateHandleOpts) => {
  // in our tables, both primary keys and indexes are derived properties
  // overloaded indexes are ALWAYS derived props
  const derivedProps = tableDefinition.AttributeDefinitions.map(a => a.AttributeName)

  const db = createDB({
    modelStore: createModelStore({ models }),
    tableNames: [tableDefinition.TableName],

    // specify the definition for a particular table
    defineTable: name =>
      createTable({
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
        shouldMinify: item => false
      }),

    // optional
    logger
  })

  return db
}
