import { DBHandle, GetSubcriptionOpts, Subscription, Identity, Subscriber } from '../../types'
import * as Errors from '../../errors'

export interface SubscribersOpts {
  db: DBHandle
}

const TYPES = {
  DEVICE: 'tradle.services.PNSRegistration',
  SUBSCRIBER: 'tradle.services.PNSSubscriber',
  SUBSCRIPTION: 'tradle.services.PNSSubscription'
}

export interface CreateSubscriberOpts {}
export interface CreateSubscriptionOpts {}
export interface AddDeviceOpts {}
export interface GetSubscriberOpts {
  subscriber: string
}

export class Subscribers {
  private db: DBHandle
  constructor(ctx: SubscribersOpts) {
    this.db = ctx.db
  }

  public createSubscriber = async (opts: CreateSubscriberOpts) => this.put(TYPES.SUBSCRIBER, opts)

  public createSubscription = async (opts: CreateSubscriptionOpts) => this.put(TYPES.SUBSCRIPTION, opts)

  public getSubscriber = async ({ subscriber }: GetSubscriberOpts) =>
    this.matchOne(TYPES.SUBSCRIBER, { subscriber }) as Promise<Subscriber>
  public getSubscription = async ({ publisher, subscriber }: GetSubcriptionOpts) =>
    this.matchOne(TYPES.SUBSCRIPTION, { publisher, subscriber })

  public updateSubscriber = (sub: Subscriber) => this.put(TYPES.SUBSCRIBER, sub)
  public updateSubscription = (sub: Subscription) => this.put(TYPES.SUBSCRIPTION, sub)

  private put = async (type: string, resource: any): Promise<void> => {
    await this.db.put({ _t: type, ...resource })
  }
  private matchOne = async (type: string, props: any) => {
    return await this.db.findOne({
      filter: {
        EQ: {
          _t: type,
          ...props
        }
      }
    })
  }
}

export const create = (ctx: SubscribersOpts) => new Subscribers(ctx)
