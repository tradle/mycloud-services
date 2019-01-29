import tradle from '@tradle/protocol'
import Errors from '@tradle/errors'
import { SignedTradleObject, Identity, PushProtocol, SubscriberDB, GetSubcriptionOpts, Subscriber } from '../../types'
import * as crypto from '../../crypto'
import { PUSH_PROTOCOLS } from './constants'

export interface SubscribersOpts {
  subscriberDB: SubscriberDB
}

export interface CreateSubscriberOpts extends SignedTradleObject {
  identity: Identity
  token: string
  protocol: PushProtocol
}

export interface AddTokenOpts {
  subscriber: string
  token: string
  protocol: PushProtocol
}

export interface CreateSubscriptionOpts extends SignedTradleObject {
  publisher: string
  subscriber: string
}

export interface ClearBadgeOpts extends SignedTradleObject {
  subscriber: string
}

export interface Device {
  token: string
  protocol: string
}

export const serializeDevice = ({ token, protocol }: Device) => `${protocol}:${token}`
export const unserializeDevice = (serialized: string) => {
  const idx = serialized.indexOf(':')
  return {
    protocol: serialized.slice(0, idx),
    token: serialized.slice(idx + 1)
  }
}

export class Subscribers {
  public static validateSubscriber = (subscriber: CreateSubscriberOpts) => {
    const { identity, token, protocol } = subscriber
    crypto.validateSig({ object: identity, identity })
    crypto.validateSig({ object: subscriber, identity })

    // TODO: verify
    if (!PUSH_PROTOCOLS.includes(protocol)) {
      throw new Errors.InvalidOption(`unsupported protocol: ${protocol}`)
    }

    if (!token) {
      throw new Errors.InvalidOption('expected "token"')
    }
  }

  private db: SubscriberDB
  constructor({ subscriberDB }: SubscribersOpts) {
    this.db = subscriberDB
  }

  public create = async (subscriber: CreateSubscriberOpts) => {
    Subscribers.validateSubscriber(subscriber)

    const { identity, token, protocol } = subscriber
    const { link, permalink } = tradle.links({ object: identity })
    // add device token for subscriber permalink
    await this.addSubscriberDevice({ subscriber: permalink, token, protocol })
  }

  /**
   * Add the given device to the subscriber
   * Create the subscriber if it doesn't exist
   */
  public addSubscriberDevice = async ({ subscriber, token, protocol }: AddTokenOpts) => {
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
    if (devices.includes(device)) {
      devices.push(device)
    }

    await this.db.updateSubscriber(sub)
  }

  public createSubscription = async (subscription: CreateSubscriptionOpts) => {
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

  public updateSubscription = async (sub: any) => {
    await this.db.updateSubscription(sub)
  }
}

export const create = (ctx: SubscribersOpts) => new Subscribers(ctx)
