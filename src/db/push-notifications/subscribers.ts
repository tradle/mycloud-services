import { HexBase64BinaryEncoding } from 'crypto'
import { DBHandle, Subscriber, SerializedSubscriber, Device } from '../../types'
import { TYPES } from '../../constants'
import updateWithOptimisticLocking from './update-with-optimistic-locking'

export interface SubscribersOpts {
  db: DBHandle
}

// export interface CreateSubscriberOpts {}
export interface CreateSubscriptionOpts {}
export interface AddDeviceOpts {}
export interface GetSubscriberOpts {
  permalink: string
}

export class Subscribers {
  private db: DBHandle
  constructor(ctx: SubscribersOpts) {
    this.db = ctx.db
  }

  // public createSubscriber = async (opts: CreateSubscriberOpts) => this.put(TYPES.SUBSCRIBER, opts)

  // public createSubscription = async (opts: CreateSubscriptionOpts) => this.put(TYPES.SUBSCRIPTION, opts)

  public getSubscriber = async ({ permalink }: GetSubscriberOpts) =>
    this.db.matchOne(TYPES.SUBSCRIBER, { permalink }) as Promise<Subscriber>
  // public getSubscription = async ({ publisher, subscriber }: GetSubcriptionOpts) =>
  //   this.db.matchOne(TYPES.SUBSCRIPTION, { publisher, subscriber })

  public updateSubscriber = async (sub: Subscriber) => this.update(TYPES.SUBSCRIBER, sub)

  // use put() because subscription is signed
  // public updateSubscription = (sub: Subscription) => this.put(TYPES.SUBSCRIPTION, sub)
  // public incSubscriberUnreadCount = async (permalink: string) => {
  //   const subscriber = await this.db.matchOne(TYPES.SUBSCRIBER, { permalink })
  //   const unreadCount = (subscriber.unreadCount || 0) + 1
  //   await this.update(TYPES.SUBSCRIBER, { subscriber, unreadCount })
  // }

  private put = async (type: string, resource: any): Promise<void> => {
    await this.db.put({ _t: type, ...resource }, { overwrite: false })
  }

  private update = async (type: string, resource: any): Promise<void> => {
    if (resource._v === 0) {
      await this.put(type, resource)
      return
    }

    await updateWithOptimisticLocking({
      db: this.db,
      resource: {
        _t: type,
        ...resource
      }
    })
  }
}

export const create = (ctx: SubscribersOpts) => new Subscribers(ctx)

export const serializeSubscriber = (sub: Subscriber): SerializedSubscriber => ({
  ...sub,
  permalink: hexToBase64(sub.permalink),
  devices: sub.devices.map(serializeDevice),
  subscriptions: serializeSubscriptions(sub.subscriptions)
})

export const unserializeSubscriber = (sub: SerializedSubscriber) => ({
  ...sub,
  permalink: base64ToHex(sub.permalink),
  devices: sub.devices.map(unserializeDevice),
  subscriptions: unserializeSubscriptions(sub.subscriptions)
})

export const serializeSubscriptions = (subs: string[]) => new Buffer(subs.join(''), 'hex').toString('base64')
export const unserializeSubscriptions = (sub: string) =>
  chunkBuffer(new Buffer(sub, 'base64'), 32).map(buf => buf.toString('hex'))

const chunkBuffer = (buf: Buffer, chunkSize: number) => {
  const chunks: Buffer[] = []
  let start = 0
  while (start < buf.length) {
    const end = Math.min(start + chunkSize, buf.length)
    chunks.push(buf.slice(start, end))
    start += chunkSize
  }

  return chunks
}

export const serializeDevice = ({ token, protocol }: Device) => `${protocol}:${token}`
export const unserializeDevice = (serialized: string) => {
  const idx = serialized.indexOf(':')
  return {
    protocol: serialized.slice(0, idx),
    token: serialized.slice(idx + 1)
  }
}

const reEncodeString = (str: string, from: HexBase64BinaryEncoding, to: HexBase64BinaryEncoding) =>
  new Buffer(str, from).toString(to)
const hexToBase64 = (str: string) => reEncodeString(str, 'hex', 'base64')
const base64ToHex = (str: string) => reEncodeString(str, 'base64', 'hex')
