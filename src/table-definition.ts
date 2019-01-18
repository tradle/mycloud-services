import { TableDefinition } from './types'

export const tableDefinition:TableDefinition = {
  "Type": "AWS::DynamoDB::Table",
  "DeletionPolicy": "Retain",
  "Properties": {
    "AttributeDefinitions": [
      {
        "AttributeName": "__h__",
        "AttributeType": "S"
      },
      {
        "AttributeName": "__r__",
        "AttributeType": "S"
      },
      {
        "AttributeName": "__x0h__",
        "AttributeType": "S"
      },
      {
        "AttributeName": "__x0r__",
        "AttributeType": "S"
      },
      {
        "AttributeName": "__x1h__",
        "AttributeType": "S"
      },
      {
        "AttributeName": "__x1r__",
        "AttributeType": "S"
      },
      {
        "AttributeName": "__x2h__",
        "AttributeType": "S"
      },
      {
        "AttributeName": "__x2r__",
        "AttributeType": "S"
      },
      {
        "AttributeName": "__x3h__",
        "AttributeType": "S"
      },
      {
        "AttributeName": "__x3r__",
        "AttributeType": "S"
      },
      {
        "AttributeName": "__x4h__",
        "AttributeType": "S"
      },
      {
        "AttributeName": "__x4r__",
        "AttributeType": "S"
      }
    ],
    "KeySchema": [
      {
        "AttributeName": "__h__",
        "KeyType": "HASH"
      },
      {
        "AttributeName": "__r__",
        "KeyType": "RANGE"
      }
    ],
    "GlobalSecondaryIndexes": [
      {
        "IndexName": "idx0",
        "KeySchema": [
          {
            "AttributeName": "__x0h__",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "__x0r__",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "KEYS_ONLY"
        },
        "ProvisionedThroughput": {
          "Fn::If": [
            "DoProvisionDynamoDBScaling",
            {
              "ReadCapacityUnits": 10,
              "WriteCapacityUnits": 10
            },
            {
              "Ref": "AWS::NoValue"
            }
          ]
        }
      },
      {
        "IndexName": "idx1",
        "KeySchema": [
          {
            "AttributeName": "__x1h__",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "__x1r__",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "KEYS_ONLY"
        },
        "ProvisionedThroughput": {
          "Fn::If": [
            "DoProvisionDynamoDBScaling",
            {
              "ReadCapacityUnits": 10,
              "WriteCapacityUnits": 10
            },
            {
              "Ref": "AWS::NoValue"
            }
          ]
        }
      },
      {
        "IndexName": "idx2",
        "KeySchema": [
          {
            "AttributeName": "__x2h__",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "__x2r__",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "KEYS_ONLY"
        },
        "ProvisionedThroughput": {
          "Fn::If": [
            "DoProvisionDynamoDBScaling",
            {
              "ReadCapacityUnits": 10,
              "WriteCapacityUnits": 10
            },
            {
              "Ref": "AWS::NoValue"
            }
          ]
        }
      },
      {
        "IndexName": "idx3",
        "KeySchema": [
          {
            "AttributeName": "__x3h__",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "__x3r__",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "KEYS_ONLY"
        },
        "ProvisionedThroughput": {
          "Fn::If": [
            "DoProvisionDynamoDBScaling",
            {
              "ReadCapacityUnits": 10,
              "WriteCapacityUnits": 10
            },
            {
              "Ref": "AWS::NoValue"
            }
          ]
        }
      },
      {
        "IndexName": "idx4",
        "KeySchema": [
          {
            "AttributeName": "__x4h__",
            "KeyType": "HASH"
          },
          {
            "AttributeName": "__x4r__",
            "KeyType": "RANGE"
          }
        ],
        "Projection": {
          "ProjectionType": "KEYS_ONLY"
        },
        "ProvisionedThroughput": {
          "Fn::If": [
            "DoProvisionDynamoDBScaling",
            {
              "ReadCapacityUnits": 10,
              "WriteCapacityUnits": 10
            },
            {
              "Ref": "AWS::NoValue"
            }
          ]
        }
      }
    ]
  }
}
