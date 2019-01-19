import { DBHandle } from '@localtypes'
import * as Errors from '@errors'

interface Context {
  db: DBHandle
}

export interface CreateSubscriberOpts {}
export interface CreateSubscriptionOpts {}
export interface AddDeviceOpts {}

export class Subscriber {
  private db: DBHandle
  constructor(ctx: Context) {
    this.db = ctx.db
  }

  public create = async (opts: CreateSubscriberOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }

  public createSubscription = async (opts: CreateSubscriberOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }

  public addDevice = async (opts: AddDeviceOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }
}

export const create = (ctx: Context) => new Subscriber(ctx)
