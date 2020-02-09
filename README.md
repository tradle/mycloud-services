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
S3_USER_LOGS_PREFIX=tdl-tradle-ltd-dev-logs-12345/userlogs/
S3_PUSH_CONF_PATH=tdl-tradle-ltd-dev-privateconf-12345/services/pns.json
MY_CLOUD_TABLE_NAME=tdl-tradle-ltd-dev-bucket-0
```

```sh
# .env.offline
S3_USER_LOGS_PREFIX=tdl-tradle-ltd-dev-logs/userlogs/
S3_PUSH_CONF_PATH=tdl-tradle-ltd-dev-privateconf/services/pns.json
MY_CLOUD_TABLE_NAME=tdl-tradle-ltd-dev-bucket-0
```

`.env` should reference resources in AWS
`.env.offline` should reference resources in [localstack](https://github.com/localstack/localstack). If you have a MyCloud development environment set up, you should have the relevant S3 buckets and DynamoDB table there

### Gen APNS Certs

copied from: https://gist.github.com/telekosmos/b70df24dee342cd05503fba36f230317 

After requesting the certificate from Apple (to do this, go to __Apple Developer site__ -> __APNs Auth key__ -> __[+]__), 
download the `.cer` file (usually named `aps_production.cer` or `aps_development.cer`) from the iOS Provisioning Portal, save in a clean directory, and import it into Keychain Access.

It should now appear in the keyring under the "Certificates" category, as `
Apple Push Services`. Inside the certificate you should see a private key (only when filtering for the "Certificates" category). 

Export this private key as a `.p12` file:
- Right click in the certificate we are interested in _Keychain_ and select _Export..._
- Accept the default `.p12` file format and then click Save

or

- Keychain Access, select Keys, and then highlight your app private key.
- Click File, click Export Items..., and then enter a name in the Save As: field.


Now, in the directory containing `cert.cer` and `key.p12` (preferably at server), execute the following commands to generate your `.pem` files:

	$ openssl x509 -in cert.cer -inform DER -outform PEM -out cert.pem
	$ openssl pkcs12 -in key.p12 -out key.pem -nodes
	
Test certificates:

	$ openssl s_client -connect gateway.push.apple.com:2195 -cert cert.pem -key key.pem # production

If you are using a development certificate you may wish to name them differently to enable fast switching between development and production. The filenames are configurable within the module options, so feel free to name them something more appropriate.

It is also possible to supply a PFX (PFX/PKCS12) package containing your certificate, key and any relevant CA certificates. The method to accomplish this is left as an exercise to the reader. It should be possible to select the relevant items in "Keychain Access" and use the export option with `.p12` format.

### Local

Save your configuration to S3:

```sh
# localstack
APN_CERT_PATH=./certs/apns/cert.pem APN_KEY_PATH=./certs/apns/key.pem FCM_KEY=your-fcm-or-gcm-key npm run pushconf:local
# remote
APN_CERT_PATH=./certs/apns/cert.pem APN_KEY_PATH=./certs/apns/key.pem FCM_KEY=your-fcm-or-gcm-key npm run pushconf
```

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
