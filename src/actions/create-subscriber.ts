import tradle from '@tradle/protocol'
import { Identity, PushProtocol, DB, SignedTradleObject } from '../types'
import { validateSig } from '../validate-sig'
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

export const createHandler = ({ db }: Context) => async (subscriber: CreateSubscriberOpts) => {
  const { identity, token, protocol } = subscriber
  try {
    validateSig({ object: identity, identity })
  } catch (err) {
    throw new Errors.InvalidParameter('invalid identity')
  }

  try {
    validateSig({ object: subscriber, identity })
  } catch (err) {
    throw new Errors.InvalidParameter('invalid signature')
  }

  // TODO: verify
  if (!PUSH_PROTOCOLS.includes(protocol)) {
    throw new Errors.InvalidParameter(`unsupported protocol: ${protocol}`)
  }

  if (!token) {
    throw new Errors.InvalidParameter('expected "token"')
  }

  const { link, permalink } = tradle.links({ object: identity })
  // add device token for subscriber permalink
  await addTokenForSubscriber({ db, subscriber: permalink, token, protocol })
}
