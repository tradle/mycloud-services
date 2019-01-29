import { PubSub } from '../../../types'
import { SNSClient } from '@tradle/aws-sns-client'

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
  public get createTopic() {
    return this.sns.createTopic.bind(this.sns)
  }
  public allowPublish = async ({ topic, publisherId }) => {
    await this.sns.allowCrossAccountPublish(topic, [publisherId])
  }
}

export const createPubSub = (opts: SNSPubSubOpts) => new SNSPubSub(opts)
