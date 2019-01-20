import { DBHandle } from '@localtypes'
import * as Errors from '../errors'

interface PublisherOpts {
  db: DBHandle
}

interface ECPubKey {
  pub: string
  curve: string
}

export interface RegisterPublisherOpts {
  challenge: string
  link: string
  key: ECPubKey
}

export interface ConfirmPublisherOpts {
  //   link: string
  //   key: ECPubKey
}

export class Publisher {
  private db: DBHandle
  constructor(ctx: PublisherOpts) {
    this.db = ctx.db
  }

  public register = async (opts: RegisterPublisherOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }

  public confirm = async (opts: ConfirmPublisherOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }
}

export const create = (ctx: PublisherOpts) => new Publisher(ctx)
