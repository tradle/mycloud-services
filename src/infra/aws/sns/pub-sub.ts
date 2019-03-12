import { SNSClient, parseTopicArn } from '@tradle/aws-sns-client'
import { LambdaClient } from '@tradle/aws-lambda-client'
import { parseArn } from '@tradle/aws-common-utils'
import { PubSub, Logger } from '../../../types'

interface SNSPubSubOpts {
  sns: SNSClient
  lambda: LambdaClient
  logger: Logger
  local?: boolean
}

export class SNSPubSub implements PubSub {
  constructor(private opts: SNSPubSubOpts) {}

  public get publish() {
    return this.opts.sns.publish.bind(this.opts.sns)
  }
  public subscribe = async ({ topic, target }) => {
    if (this.opts.local) return

    const tasks = []
    tasks.push(this.opts.sns.subscribeIfNotSubscribed({ topic, target }))
    tasks.push(this.opts.lambda.allowSNSToInvoke(target))

    await Promise.all(tasks)

    this.opts.logger.debug({
      action: 'sns-subscribe',
      topic,
      target
    })
  }
  public createTopic = async (arn: string) => {
    const { name, region } = parseTopicArn(arn)
    await this.opts.sns.createTopic({ name, region })
    this.opts.logger.debug({
      action: 'create-topic',
      topic: arn
    })
  }

  public allowPublish = async ({ topic, publisherId }) => {
    if (!this.opts.local && parseArn(topic).accountId !== publisherId) {
      await this.opts.sns.allowCrossAccountPublish(topic, [publisherId])
      this.opts.logger.debug({
        action: 'allow-cross-account-publish',
        topic,
        publisherId
      })

      return
    }

    this.opts.logger.debug({
      action: 'skip-allow-publish',
      reason: 'publisher and subscriber are the same account'
    })
  }
}

export const createPubSub = (opts: SNSPubSubOpts) => new SNSPubSub(opts)
