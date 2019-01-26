// import { promisify } from 'util'
// import * as t from 'io-ts'
// import nkeyEC from 'nkey-ecdsa'
import {
  Models,
  PublisherDB,
  PubSub,
  CreatePublisherTopicName,
  VerifyChallengeResponseOpts,
  RegisterPublisherOpts,
  RegisterPublisherOptsV,
  NotifyOpts,
  NotifyOptsV,
  PushNotifier
} from '../../types'
import * as Errors from '../../errors'
// import * as crypto from '../../crypto'
import * as assert from '../../utils/assert'
import { Subscribers } from './subscribers'

export interface PublishersOpts {
  publisherDB: PublisherDB
  subscribers: Subscribers
  pubSub: PubSub
  models: Models
  createPublisherTopicName: CreatePublisherTopicName
  pushNotifier: PushNotifier
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

export class Publishers {
  constructor(private opts: PublishersOpts) {}
  public register = async (opts: RegisterPublisherOpts) => {
    assert.isTypeOf(opts, RegisterPublisherOptsV)
    const { pubSub, createPublisherTopicName } = this.opts
    if (!pubSub.createTopic) {
      throw new Errors.Unsupported(`local pubSub doesn't support 'createTopic'`)
    }

    await pubSub.createTopic(createPublisherTopicName(opts))
  }

  public notify = async (opts: NotifyOpts) => {
    assert.isTypeOf(opts, NotifyOptsV)
    const { subscribers, pushNotifier } = this.opts
    const { publisher, subscriber } = opts
    const subscription = await subscribers.getSubscription({ subscriber, publisher })
    const { deviceTokens, seq } = subscription
    subscription.seq++
    await pushNotifier.notify({ deviceTokens, badge: seq })
    await subscribers.updateSubscription(subscription)
  }
}

export const create = (ctx: PublishersOpts) => new Publishers(ctx)
