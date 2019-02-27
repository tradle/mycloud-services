// import { SNSHandler } from 'aws-lambda'
// import { createContainer } from '../../../container'
// import { Publishers } from '../../../domain/push-notifications/publishers'
// import { parseEvent } from '../parse/register-publisher'

// const container = createContainer()
// const publisherPromise = container.ready.then(() => new Publishers(container))

// export const handler: SNSHandler = async event => {
//   const publishers = await publisherPromise
//   publishers.register(parseEvent(event))
// }
