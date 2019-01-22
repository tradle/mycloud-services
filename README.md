# tradle-services

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
