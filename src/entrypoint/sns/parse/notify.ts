import { SNSEvent } from 'aws-lambda'
import { Container, NotifyOpts } from '../../../types'
import * as Errors from '../../../errors'

interface ParseEventOpts {
  container: Container
  event: SNSEvent
}

export const parseEvent = ({ event, container }: ParseEventOpts): NotifyOpts => {
  const { Sns } = event.Records[0]
  const { Message, TopicArn } = Sns

  let payload: any
  try {
    payload = JSON.parse(Message)
  } catch (err) {
    throw new Errors.InvalidOption(`expected { subscriber, seq }`)
  }

  return {
    seq: payload.seq,
    subscriber: payload.subscriber,
    publisher: container.parsePublisherTopic(TopicArn).publisher
  }
}
