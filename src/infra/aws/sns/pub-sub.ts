import AWS from 'aws-sdk'
import { PubSub, PublishOpts, SubscribeOpts, SNSClients } from '../../../types'

type DeliveryProtocol = 'http' | 'https' | 'email' | 'email-json' | 'lambda' | 'sms' | 'sqs' | 'application'

export const parseTargetProtocol = (target: string): DeliveryProtocol => {
  if (target.startsWith('arn:aws')) {
    return target.split(':')[2] as DeliveryProtocol
  }

  if (target.startsWith('http://')) return 'http'
  if (target.startsWith('https://')) return 'https'

  if (/^\d+$/.test(target)) return 'sms'

  return 'application'
}

export const parseTopicRegion = (topic: string): string => topic.split(':')[3]

interface SNSPubSubOpts {
  regionalClients: SNSClients
}

export class SNSPubSub implements PubSub {
  private byRegion: SNSClients
  private snsOpts: AWS.SNS.Types.ClientConfiguration
  constructor({ regionalClients }: SNSPubSubOpts) {
    this.byRegion = regionalClients
  }

  public publish = async ({ message, topic }: PublishOpts) => {
    const region = parseTopicRegion(topic)
    const params: AWS.SNS.PublishInput = {
      TopicArn: topic,
      Message: message
    }

    await this.byRegion[region].publish(params).promise()
  }

  public subscribe = async ({ topic, target }: SubscribeOpts) => {
    const protocol = parseTargetProtocol(target)
    const region = parseTopicRegion(topic)
    const params: AWS.SNS.SubscribeInput = {
      TopicArn: topic,
      Protocol: protocol
    }

    await this.byRegion[region].subscribe(params).promise()
  }

  public createTopic = async (topic: string) => {
    const region = parseTopicRegion(topic)
    const params: AWS.SNS.CreateTopicInput = {
      Name: topic
    }

    await this.byRegion[region].createTopic(params).promise()
  }
}

export const createPubSub = (opts: SNSPubSubOpts) => new SNSPubSub(opts)
