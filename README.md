# tradle-services

## Setup:

### Clone and Install

```sh
git clone https://github.com/tradle/mycloud-services
cd mycloud-services
npm install
```

Create two env files (`.env` and `.env.offline`) in this project's root folder with the following variables (adapt to your resource names):

For example:

```sh
# .env
S3_USER_LOGS_PREFIX=tdl-tradle-ltd-dev-logs-12345/userlogs
S3_PUSH_CONF_PATH=tdl-tradle-ltd-dev-privateconf-12345/services/pns.json
MY_CLOUD_TABLE_NAME=tdl-tradle-ltd-dev-bucket-0
```

```sh
# .env.offline
S3_USER_LOGS_PREFIX=tdl-tradle-ltd-dev-logs/userlogs
S3_PUSH_CONF_PATH=tdl-tradle-ltd-dev-privateconf/services/pns.json
MY_CLOUD_TABLE_NAME=tdl-tradle-ltd-dev-bucket-0
```

`.env` should reference resources in AWS
`.env.offline` should reference resources in [localstack](https://github.com/localstack/localstack). If you have a MyCloud development environment set up, you should have the relevant S3 buckets and DynamoDB table there

## Folder Structure

Roughly approximates the "Clean Architecture" by "Uncle Bob"

### serverless.yml

used by the serverless framework to generate this stack's CloudFormation

### src/config/

environment-specific configuration. The primary environments are local (serverless-offline with localstack) and remote (in AWS Lambda)

### src/container.ts

the object that aggregates dependencies, and is used to inject dependencies into various other components.

### src/infra/

AWS-specific adapters to DynamoDB, S3. AWS-specific code shouldn't appear anywhere other than here and in src/config/aws

### src/entrypoint/

where requests from the outside world originate. Currently this is only http (APIGateway)

### src/root-handler.ts

exports the lambda handler: currently this is the same handler for all, with a router to route requests

### src/db/

wrappers around the generic db handle (@tradle/dynamodb) that abstract away the db and export semantic methods like createPublisher, createSubscriber

these layer protects src/domain/ from having to know about the @tradle/dynamodb API and capabilities

### src/db/

wrappers around the generic db handle (@tradle/dynamodb) that abstract away the db and export semantic methods like createPublisher, createSubscriber

### src/domain/

application specific flows, e.g. `publisher.register(...)` or `subscriber.create(...)` or `subscriber.subscribe(...)`

### src/test/

tests
