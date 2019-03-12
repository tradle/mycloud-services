import tradle from '@tradle/protocol'
import { Errors } from '@tradle/aws-common-utils'
import {
  SubscribersDB,
  Subscriber,
  Subscription,
  RegisterDeviceOpts,
  AddSubscriberDeviceOpts,
  AddSubscriberDeviceOptsV,
  ClearBadgeOpts,
  SubscribersOpts,
  CreateSubscriptionOpts,
  Logger
} from '../../types'
import * as crypto from '../../crypto'
import { PUSH_PROTOCOLS, TYPES } from '../../constants'
import * as assert from '../../utils/assert'
import CustomErrors from '../../errors'

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
  private logger: Logger
  constructor({ subscribersDB, logger }: SubscribersOpts) {
    this.db = subscribersDB
    this.logger = logger
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

    const { subscriber, protocol } = opts
    await this.db.updateSubscriber(subscriber, withDevice(opts))

    this.logger.debug({
      action: 'register-device',
      subscriber,
      protocol
    })
  }

  public createSubscription = async ({ subscription }: CreateSubscriptionOpts) => {
    await this.db.updateSubscriber(subscription.subscriber, withSubscription(subscription))
    this.logger.debug({
      action: 'subscribe',
      subscriber: subscription.subscriber,
      publisher: subscription.publisher
    })
  }

  public clearBadge = async (opts: ClearBadgeOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }

  // public getSubscription = async (opts: GetSubcriptionOpts) => {
  //   return await this.db.getSubscription(opts)
  // }

  // public get updateSubscription() {
  //   return this.db.updateSubscription
  // }
  // public get incSubscriberUnreadCount() {
  //   return this.db.incSubscriberUnreadCount
  // }

  public get getSubscriber() {
    return this.db.getSubscriber
  }
}

export const create = (ctx: SubscribersOpts) => new Subscribers(ctx)

export const withSubscription = ({ publisher }: Subscription) => (subscriber: Subscriber) => {
  const { subscriptions = [] } = subscriber
  if (subscriptions.includes(publisher)) {
    throw new CustomErrors.UpdateAborted('already subscribed')
  }

  return normalizeSubscriberUpdate({
    ...subscriber,
    subscriptions: subscriptions.filter(existing => existing !== publisher).concat(publisher)
  })
}

export const withDevice = ({ subscriber, protocol, token }: AddSubscriberDeviceOpts) => (sub: Subscriber) => {
  const { devices = [] } = sub
  if (devices.some(d => d.token === token)) {
    throw new CustomErrors.UpdateAborted('already have token')
  }

  return normalizeSubscriberUpdate({
    ...sub,
    permalink: subscriber,
    devices: [...devices.filter(d => d.token !== token), { protocol, token }]
  })
}

const normalizeSubscriberUpdate = (subscriber: Subscriber) => ({
  ...subscriber,
  _t: TYPES.SUBSCRIBER,
  _v: typeof subscriber._v === 'number' ? subscriber._v + 1 : 0,
  devices: subscriber.devices || [],
  subscriptions: subscriber.subscriptions || []
})
