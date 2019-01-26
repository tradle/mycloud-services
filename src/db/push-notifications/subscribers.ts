import { DBHandle, GetSubcriptionOpts, Subscription } from '../../types'
import * as Errors from '../../errors'

interface SubscribersOpts {
  db: DBHandle
}

export interface CreateSubscriberOpts {}
export interface CreateSubscriptionOpts {}
export interface AddDeviceOpts {}

export class Subscribers {
  private db: DBHandle
  constructor(ctx: SubscribersOpts) {
    this.db = ctx.db
  }

  public create = async (opts: CreateSubscriberOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }

  public createSubscription = async (opts: CreateSubscriptionOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }

  public addDevice = async (opts: AddDeviceOpts) => {
    throw new Errors.NotImplemented('implement me!')
  }

  public getSubscription = async (opts: GetSubcriptionOpts) => {
    const sub = await this.db.findOne({
      filter: {
        EQ: {
          _t: 'tradle.PNSSubscription',
          'publisher.permalink': opts.publisher,
          'subscriber.permalink': opts.subscriber
        }
      }
    })

    return sub
  }

  public updateSubscription = async (sub: Subscription) => {
    await this.db.put(sub)
  }
}

export const create = (ctx: SubscribersOpts) => new Subscribers(ctx)
