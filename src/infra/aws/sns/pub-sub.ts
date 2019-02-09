import { PubSub } from '../../../types'
import { SNSClient, parseTopicArn } from '@tradle/aws-sns-client'

interface SNSPubSubOpts {
  sns: SNSClient
}

export class SNSPubSub implements PubSub {
  private sns: SNSClient
  constructor({ sns }: SNSPubSubOpts) {
    this.sns = sns
  }

  public get publish() {
    return this.sns.publish.bind(this.sns)
  }
  public get subscribe() {
    return this.sns.subscribeIfNotSubscribed.bind(this.sns)
  }
  public createTopic = async (arn: string) => {
    const { name, region } = parseTopicArn(arn)
    await this.sns.createTopic({ name, region })
  }

  public allowPublish = async ({ topic, publisherId }) => {
    await this.sns.allowCrossAccountPublish(topic, [publisherId])
  }
}

export const createPubSub = (opts: SNSPubSubOpts) => new SNSPubSub(opts)
