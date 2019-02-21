import { SNSHandler } from 'aws-lambda'
import { createContainer } from '../../../container'
import { Publishers } from '../../../domain/push-notifications/publishers'
import { parseEvent } from '../parse/notify'

const container = createContainer()
const publisherPromise = container.ready.then(() => new Publishers(container))

export const handler: SNSHandler = async event => {
  const publishers = await publisherPromise
  try {
    await publishers.notify(parseEvent({ event, container }))
  } catch (err) {
    const { message, ...rest } = err
    container.logger.error({ message: `failed to notify subscriber: ${message}`, ...rest })
  }
}
