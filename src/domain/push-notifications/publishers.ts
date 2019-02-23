import {
  Models,
  PublishersDB,
  PubSub,
  CreatePublisherTopicName,
  RegisterPublisherOpts,
  RegisterPublisherOptsV,
  NotifyOpts,
  NotifyOptsV,
  PushNotifier
} from '../../types'
import * as assert from '../../utils/assert'
import Errors from '../../errors'
import { Subscribers } from './subscribers'

export interface PublishersOpts {
  publishersDB: PublishersDB
  subscribers: Subscribers
  pubSub: PubSub
  models: Models
  createPublisherTopicName: CreatePublisherTopicName
  pushNotifier: PushNotifier
  notificationsTarget: string
}

// export const verifyChallengeResponse = async (opts: VerifyChallengeResponseOpts) => {
//   const key = nkeyEC.fromJSON(opts.key)
//   const { nonce, salt, sig } = opts
//   const verify = promisify(key.verify.bind(key))
//   const verified = await verify(crypto.sha256(nonce + salt), sig)
//   if (!verified) {
//     throw new Errors.InvalidSignature(`failed to confirm publisher`)
//   }
// }

// export const genChallengeForPublisher = () => crypto.genNonce(32, 'base64')

export const createPushMessage = (name: string) => `You have unread messages from: ${name}`

// for now, always show one, later we'll count
const BADGES = {
  ONE: 1
}

export class Publishers {
  constructor(private opts: PublishersOpts) {}
  /**
   * idempotent
   */
  public register = async (opts: RegisterPublisherOpts) => {
    assert.isTypeOf(opts, RegisterPublisherOptsV)

    const { pubSub, createPublisherTopicName, notificationsTarget } = this.opts
    const topic = createPublisherTopicName(opts)
    if (pubSub.createTopic) {
      await pubSub.createTopic(topic)
    }

    const tasks = []
    if (pubSub.allowPublish) {
      const allowPublish = pubSub.allowPublish({ topic, publisherId: opts.accountId })
      tasks.push(allowPublish)
    }

    const subscribe = pubSub.subscribe({
      topic,
      target: notificationsTarget
    })

    tasks.push(subscribe)
    await Promise.all(tasks)
  }

  public notify = async (opts: NotifyOpts) => {
    assert.isTypeOf(opts, NotifyOptsV)
    const { publishersDB, subscribers, pushNotifier } = this.opts
    const [subscriber, publisherName] = await Promise.all([
      subscribers.getSubscriber({ permalink: opts.subscriber }),
      publishersDB.getPublisherName(opts.publisher)
    ])

    const { devices, subscriptions = [] } = subscriber
    if (!subscriptions.includes(opts.publisher)) {
      throw new Errors.Forbidden('subscriber is not subscribed')
    }

    const title = createPushMessage(publisherName)
    await pushNotifier.notify({
      deviceTokens: devices.map(d => d.token),
      // title,
      body: title,
      badge: BADGES.ONE
    })
  }
}

export const create = (ctx: PublishersOpts) => new Publishers(ctx)
