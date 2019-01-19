import pick from 'lodash/pick'
import { Identity, PublicKey } from '@localtypes'
import { Publisher as DB } from '../db/publisher'
import * as Errors from '@errors'
import * as crypto from '../crypto'

export interface Context {
  db: DB
}

export interface RegisterPublisherOpts {
  identity: Identity
  key: PublicKey
}

export interface ConfirmPublisherOpts {
  nonce: string
  salt: string
  sig: string
}

export interface NotifyOpts {
  subscriber: string
}

export class Publisher {
  private db: DB
  constructor({ db }: Context) {
    this.db = db
  }

  public register = async ({ identity, key }: RegisterPublisherOpts) => {
    crypto.validateSig({ object: identity, identity })
    const link = crypto.getObjectLink(identity)
    const challenge = crypto.genChallengeForPublisher()
    await this.db.register({ challenge, link, key: pick(key, ['pub', 'curve']) })
    return {
      challenge
    }
  }

  public confirm = async (opts: ConfirmPublisherOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }

  public notify = async (opts: NotifyOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }
}

export const create = (ctx: Context) => new Publisher(ctx)
