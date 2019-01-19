import crypto from 'crypto'
import tradle from '@tradle/protocol'
import { validateSig } from '../validate-sig'
import { DB, Identity, PublicKey } from '../types'
import * as Errors from '../errors'

export interface Context {
  db: DB
}

export interface CreatePublisherHandlerOpts {
  identity: Identity
  key: PublicKey
}

export interface CreatePublisherOpts extends CreatePublisherHandlerOpts {
  db: DB
}

export const createPublisher = async ({ db, identity, key }: CreatePublisherOpts) => {
  try {
    validateSig({ object: identity, identity })
  } catch (err) {
    throw new Errors.InvalidParameter('invalid identity')
  }

  const link = tradle.linkString(identity)
  const nonce = crypto.randomBytes(32).toString('base64')
  await db.createPublisher({ nonce, link, key })
}

export const createHandler = ({ db }: Context) => ({ identity, key }: CreatePublisherHandlerOpts) =>
  createPublisher({ db, identity, key })
