import { SNS } from '@tradle/aws-utils'
import { PubSub, PublishOpts, SubscribeOpts, SNSClients } from '../../../types'

interface SNSPubSubOpts {
  client: SNS.Client
}

export class SNSPubSub implements PubSub {
  private client: SNS.Client
  constructor({ client }: SNSPubSubOpts) {
    this.client = client
  }

  public publish = async ({ message, topic }: PublishOpts) => this.client.publish({ message, topic })
  public subscribe = async ({ topic, target }: SubscribeOpts) => this.client.subscribe({ topic, target })
  public createTopic = (topic: string) => this.client.createTopic(topic)
  public allowPublish = async ({ topic, publisherId }) => {
    const region = parseTopicRegion(topic)
    await this.byRegion[region]
      .addPermission({
        AWSAccountId: publisherId,
        TopicArn: topic,
        ActionName
      })
      .promise()
  }
}

export const createPubSub = (opts: SNSPubSubOpts) => new SNSPubSub(opts)
