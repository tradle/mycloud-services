import { DBHandle, GetSubcriptionOpts, Subscription, Identity, Subscriber } from '../../types'
import { TYPES } from '../../constants'

export interface SubscribersOpts {
  db: DBHandle
}

// export interface CreateSubscriberOpts {}
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

  // public createSubscriber = async (opts: CreateSubscriberOpts) => this.put(TYPES.SUBSCRIBER, opts)

  public createSubscription = async (opts: CreateSubscriptionOpts) => this.put(TYPES.SUBSCRIPTION, opts)

  public getSubscriber = async ({ subscriber }: GetSubscriberOpts) =>
    this.db.matchOne(TYPES.SUBSCRIBER, { subscriber }) as Promise<Subscriber>
  public getSubscription = async ({ publisher, subscriber }: GetSubcriptionOpts) =>
    this.db.matchOne(TYPES.SUBSCRIPTION, { publisher, subscriber })

  public updateSubscriber = (sub: Subscriber) => this.update(TYPES.SUBSCRIBER, sub)
  // use put() because subscription is signed
  public updateSubscription = (sub: Subscription) => this.put(TYPES.SUBSCRIPTION, sub)
  public incSubscriberUnreadCount = async (permalink: string) => {
    const subscriber = await this.db.matchOne(TYPES.SUBSCRIBER, { permalink })
    const unreadCount = (subscriber.unreadCount || 0) + 1
    await this.update(TYPES.SUBSCRIBER, { subscriber, unreadCount })
  }

  private put = async (type: string, resource: any): Promise<void> => {
    await this.db.put({ _t: type, ...resource })
  }

  private update = async (type: string, resource: any): Promise<void> => {
    await this.db.update({ _t: type, ...resource })
  }
}

export const create = (ctx: SubscribersOpts) => new Subscribers(ctx)
