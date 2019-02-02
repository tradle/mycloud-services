import * as t from 'io-ts'
import tradle from '@tradle/protocol'
import Errors from '@tradle/errors'
import {
  SignedTradleObject,
  Identity,
  PushProtocol,
  SubscribersDB,
  GetSubcriptionOpts,
  Subscriber,
  Subscription
} from '../../types'
import * as crypto from '../../crypto'
import { PUSH_PROTOCOLS } from '../../constants'
import * as assert from '../../utils/assert'

export interface SubscribersOpts {
  subscribersDB: SubscribersDB
}

export const DeviceV = t.type({
  token: t.string,
  protocol: t.keyof({
    apns: true,
    gcm: true
  })
  // protocol: t.keyof(
  //   PUSH_PROTOCOLS.reduce((obj, name) => {
  //     obj[name] = true
  //     return obj
  //   }, {})
  // )
})

export type Device = t.TypeOf<typeof DeviceV>

export const AddSubscriberDeviceOptsV = t.intersection([
  DeviceV,
  t.type({
    subscriber: t.string
  })
])

export type AddSubscriberDeviceOpts = t.TypeOf<typeof AddSubscriberDeviceOptsV>
export interface SignedDevice extends SignedTradleObject, Device {
  identity: Identity
}
export interface RegisterDeviceOpts {
  device: SignedDevice
}

export interface Subscription extends SignedTradleObject {
  publisher: string
  subscriber: string
}

export interface CreateSubscriptionOpts {
  subscription: Subscription
}

export interface ClearBadgeOpts extends SignedTradleObject {
  subscriber: string
}

export const serializeDevice = ({ token, protocol }: Device) => `${protocol}:${token}`
export const unserializeDevice = (serialized: string) => {
  const idx = serialized.indexOf(':')
  return {
    protocol: serialized.slice(0, idx),
    token: serialized.slice(idx + 1)
  }
}

export const validateSubscriberDevice = ({ device }: RegisterDeviceOpts) => {
  const { identity, token, protocol } = device
  crypto.validateSig({ object: identity, identity })
  crypto.validateSig({ object: device, identity })

  // TODO: verify
  if (!PUSH_PROTOCOLS.includes(protocol)) {
    throw new Errors.InvalidOption(`unsupported protocol: ${protocol}`)
  }

  if (!token) {
    throw new Errors.InvalidOption('expected "token"')
  }
}

export class Subscribers {
  private db: SubscribersDB
  public get validateSubscriber() {
    return validateSubscriberDevice
  }
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
      sub = await this.db.getSubscriber({ subscriber })
    } catch (err) {
      Errors.ignore(err, Errors.NotFound)
      sub = {
        permalink: subscriber,
        devices: []
      }
    }

    if (!sub.devices) sub.devices = []

    const { devices } = sub
    const device = serializeDevice({ token, protocol })
    if (!devices.includes(device)) {
      devices.push(device)
    }

    await this.db.updateSubscriber({
      permalink: sub.permalink,
      devices
    })
  }

  public createSubscription = async ({ subscription }: CreateSubscriptionOpts) => {
    const { subscriber } = subscription
    const sub = await this.db.getSubscriber({ subscriber })
    // const subsBloom = sub.subs
    // addToBloomFilter({ bloom: subsBloom, item: subsBloom })
    await this.db.updateSubscriber(sub)
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
