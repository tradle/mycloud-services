import tradle from '@tradle/protocol'
import { Errors } from '@tradle/aws-common-utils'
import {
  SubscribersDB,
  GetSubcriptionOpts,
  Subscriber,
  Subscription,
  RegisterDeviceOpts,
  AddSubscriberDeviceOpts,
  AddSubscriberDeviceOptsV,
  ClearBadgeOpts,
  SubscribersOpts,
  Device,
  CreateSubscriptionOpts,
  SignedTradleObject
} from '../../types'
import * as crypto from '../../crypto'
import { PUSH_PROTOCOLS } from '../../constants'
import * as assert from '../../utils/assert'

export const validateDevice = async (opts: RegisterDeviceOpts) => {
  if (!(opts && opts.device)) throw new Errors.InvalidOption(`invalid subscriber device`)

  const { device } = opts
  const { identity, token, protocol } = device
  const author = {
    object: identity,
    permalink: identity[tradle.constants.PERMALINK],
    link: tradle.linkString(identity)
  }

  await crypto.validateSig({ object: identity, author })
  if (!author.permalink) author.permalink = author.link

  await crypto.validateSig({ object: device, author })

  // TODO: verify
  if (!PUSH_PROTOCOLS.includes(protocol)) {
    throw new Errors.InvalidOption(`unsupported protocol: ${protocol}`)
  }

  if (!token) {
    throw new Errors.InvalidOption('expected "token"')
  }
}

export class Subscribers {
  public validateDevice = validateDevice
  private db: SubscribersDB
  constructor({ subscribersDB: subscriberDB }: SubscribersOpts) {
    this.db = subscriberDB
  }
  public registerDevice = async ({ device }: RegisterDeviceOpts) => {
    const { identity, token, protocol } = device
    // add device token for subscriber permalink
    const { permalink } = tradle.links({ object: identity })
    await this.addSubscriberDevice({ subscriber: permalink, token, protocol })
  }

  /**
   * Add the given device to the subscriber
   * Create the subscriber if it doesn't exist
   */
  public addSubscriberDevice = async (opts: AddSubscriberDeviceOpts) => {
    assert.isTypeOf(opts, AddSubscriberDeviceOptsV)

    const { subscriber, token, protocol } = opts
    let sub: Subscriber
    try {
      sub = await this.getSubscriber({ permalink: subscriber })
    } catch (err) {
      Errors.ignoreNotFound(err)
      sub = {
        permalink: subscriber,
        devices: [],
        subscriptions: []
      }
    }

    if (!sub.devices) sub.devices = []

    const device: Device = { token, protocol }
    const { devices } = sub
    if (!devices.includes(device)) {
      devices.push(device)
    }

    await this.db.updateSubscriber({ ...sub, devices })
  }

  // public validateAuthor = (object: SignedTradleObject) => {
  //    const { _author } = object
  //    await this.
  // }
  public createSubscription = async ({ subscription }: CreateSubscriptionOpts) => {
    const subscriber = await this.db.getSubscriber({ permalink: subscription.subscriber })
    await this.db.updateSubscriber(withSubscription({ subscriber, subscription }))
  }

  public clearBadge = async (opts: ClearBadgeOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }

  public getSubscription = async (opts: GetSubcriptionOpts) => {
    return await this.db.getSubscription(opts)
  }

  public get updateSubscription() {
    return this.db.updateSubscription
  }
  public get incSubscriberUnreadCount() {
    return this.db.incSubscriberUnreadCount
  }

  public get getSubscriber() {
    return this.db.getSubscriber
  }
}

export const create = (ctx: SubscribersOpts) => new Subscribers(ctx)

interface WithSubscriptionOpts {
  subscriber: Subscriber
  subscription: Subscription
}
export const withSubscription = ({ subscriber, subscription }: WithSubscriptionOpts): Subscriber => ({
  ...subscriber,
  subscriptions: (subscriber.subscriptions || [])
    .filter(s => s !== subscription.publisher)
    .concat(subscription.publisher)
})
