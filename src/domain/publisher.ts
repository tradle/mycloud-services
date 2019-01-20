import pick from 'lodash/pick'
import { IdentityV, ECPubKeyV } from '../types'
import * as t from 'io-ts'
import { Publisher as PublisherStorage } from '../db/publisher'
import * as Errors from '../errors'
import * as crypto from '../crypto'
import * as assert from '../assert'

export interface PublisherOpts {
  db: PublisherStorage
}

export const RegisterPublisherOptsV = t.type({
  identity: IdentityV,
  key: ECPubKeyV
})

export type RegisterPublisherOpts = t.TypeOf<typeof RegisterPublisherOptsV>

export const ConfirmPublisherOptsV = t.type({
  nonce: t.string,
  salt: t.string,
  sig: t.string
})

export type ConfirmPublisherOpts = t.TypeOf<typeof ConfirmPublisherOptsV>

export const NotifyOptsV = t.type({
  subscriber: t.string
})

export type NotifyOpts = t.TypeOf<typeof NotifyOptsV>

export class Publisher {
  private db: PublisherStorage
  constructor({ db }: PublisherOpts) {
    this.db = db
  }

  public register = async (opts: RegisterPublisherOpts) => {
    assert.isTypeOf(opts, RegisterPublisherOptsV)

    const { identity, key } = opts
    crypto.validateSig({ object: identity, identity })
    const link = crypto.getObjectLink(identity)
    const challenge = crypto.genChallengeForPublisher()
    await this.db.register({ challenge, link, key: pick(key, ['pub', 'curve']) })
    return {
      challenge
    }
  }

  public confirm = async (opts: ConfirmPublisherOpts) => {
    assert.isTypeOf(opts, ConfirmPublisherOptsV)
    throw new Errors.NotImplemented('implement me!')
  }

  public notify = async (opts: NotifyOpts) => {
    assert.isTypeOf(opts, NotifyOptsV)
    throw new Errors.NotImplemented('implement me!')
  }
}

export const create = (ctx: PublisherOpts) => new Publisher(ctx)
