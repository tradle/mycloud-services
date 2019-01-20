import tradle from '@tradle/protocol'
import { SignedTradleObject, Identity, PushProtocol } from '@localtypes'
import { Subscriber as DB } from '../db/subscriber'
import * as Errors from '../errors'
import * as crypto from '../crypto'
import { PUSH_PROTOCOLS } from '../constants'

export interface SubscriberOpts {
  db: DB
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

export class Subscriber {
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

  private db: DB
  constructor({ db }: SubscriberOpts) {
    this.db = db
  }

  public create = async (subscriber: CreateSubscriberOpts) => {
    Subscriber.validateSubscriber(subscriber)

    const { identity, token, protocol } = subscriber
    const { link, permalink } = tradle.links({ object: identity })
    // add device token for subscriber permalink
    await this.db.addDevice({ subscriber: permalink, token, protocol })
  }

  public addSubscriberDevice = async ({ subscriber, token, protocol }: AddTokenOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }

  public createSubscription = async (subscription: CreateSubscriptionOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }

  public clearBadge = async (opts: ClearBadgeOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }
}

export const create = (ctx: SubscriberOpts) => new Subscriber(ctx)
