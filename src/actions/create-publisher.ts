import pick from 'lodash/pick'
import { DB, Identity, PublicKey } from '../types'
import * as Errors from '../errors'
import * as crypto from '../crypto'

export interface Context {
  db: DB
}

export interface CreatePublisherOpts {
  identity: Identity
  key: PublicKey
}

export const create = ({ db }: Context) => async ({ identity, key }: CreatePublisherOpts) => {
  crypto.validateSig({ object: identity, identity })
  const link = crypto.getObjectLink(identity)
  const nonce = crypto.genNonceForPublisher()
  await db.createPublisher({ nonce, link, key: pick(key, ['pub', 'curve']) })
}
