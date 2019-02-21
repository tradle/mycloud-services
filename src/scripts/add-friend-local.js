#!/usr/bin/env node

const path = require('path')

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env.offline')
})

const TableName = process.env.MY_CLOUD_TABLE_NAME
if (!TableName) {
  throw new Error('expected MY_CLOUD_TABLE_NAME env var to be set')
}

const AWS = require('aws-sdk')
const { targetLocalstack } = require('@tradle/aws-common-utils')
const friend = require('../../fixtures/friend.json')

targetLocalstack()

const dynamodb = new AWS.DynamoDB.DocumentClient()
dynamodb
  .put({
    TableName,
    Item: friend
  })
  .promise()
  .catch(err => {
    console.error(err.stack)
    process.exitCode = 1
  })
