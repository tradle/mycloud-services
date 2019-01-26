import pick from 'lodash/pick'
import { SNSEvent } from 'aws-lambda'
import * as Errors from '../../../errors'
import { RegisterPublisherOpts } from '../../../domain/push-notifications/publishers'

export const parseEvent = (event: SNSEvent): RegisterPublisherOpts => {
  try {
    const payload = JSON.parse(event.Records[0].Sns.Message)
    return pick(payload, ['permalink', 'accountId', 'region'])
  } catch (err) {
    throw new Errors.InvalidOption(`expected { permalink, accountId, region }`)
  }
}
