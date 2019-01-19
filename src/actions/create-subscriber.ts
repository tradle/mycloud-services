import tradle from '@tradle/protocol'
import { Identity, PushProtocol, DB, SignedTradleObject } from '../types'
import * as crypto from '../crypto'
import * as Errors from '../errors'
import { PUSH_PROTOCOLS } from '../constants'

export interface Context {
  db: DB
}

export interface CreateSubscriberOpts extends SignedTradleObject {
  identity: Identity
  token: string
  protocol: PushProtocol
}

interface AddTokenOpts {
  db: DB
  subscriber: string
  token: string
  protocol: PushProtocol
}

export const addTokenForSubscriber = async ({ db, subscriber, token, protocol }: AddTokenOpts) => {
  throw new Errors.NotImplemented('implement me!')
}

export const validateSubscriber = (subscriber: CreateSubscriberOpts) => {
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

export const create = ({ db }: Context) => async (subscriber: CreateSubscriberOpts) => {
  validateSubscriber(subscriber)

  const { identity, token, protocol } = subscriber
  const { link, permalink } = tradle.links({ object: identity })
  // add device token for subscriber permalink
  await db.addSubscriberDevice({ subscriber: permalink, token, protocol })
}
