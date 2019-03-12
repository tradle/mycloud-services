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
import { PUSH_PROTOCOLS } from '../../constants'
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

    const { subscriber, token, protocol } = opts
    let sub: Subscriber
    try {
      sub = await this.getSubscriber({ permalink: subscriber })
      // backwards compat
      if (typeof sub._v !== 'number') {
        sub._v = 0
      }

      sub._v++
    } catch (err) {
      Errors.ignoreNotFound(err)
      sub = {
        permalink: subscriber,
        devices: [],
        subscriptions: [],
        _v: 0
      }
    }

    const { devices = [] } = sub
    if (!devices.find(d => d.token === token)) {
      devices.push({ protocol, token })
    }

    await this.db.updateSubscriber({ ...sub, devices })
    this.logger.debug({
      action: 'register-device',
      subscriber: sub.permalink,
      protocol
    })
  }

  public createSubscription = async ({ subscription }: CreateSubscriptionOpts) => {
    let attempts = 10
    let err: Error
    do {
      if (err) {
        this.logger.debug({
          action: 'subscribe-retry',
          error: err.message
        })
      }

      const subscriber = await this.db.getSubscriber({ permalink: subscription.subscriber })
      try {
        await this.db.updateSubscriber(withSubscription({ subscriber, subscription }))
      } catch (e) {
        err = e
      }
    } while (err && err instanceof CustomErrors.Conflict && attempts--)

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
