import { promisify } from 'util'
import pickBy from 'lodash/pickBy'
import PN from 'node-pushnotifications'
import { PushNotifier, PushNotifierNotifyOpts, PusherOpts, PusherOptsV } from '../types'
import * as assert from '../utils/assert'

const pickNonNull = <T>(obj: T): T => pickBy(obj as any, val => val != null) as T

interface PNSubResult {
  regId: string
  error: Error
}
interface PNResult {
  method: string
  success: number
  failure: number
  message: PNSubResult[]
}

export class Pusher implements PushNotifier {
  // private _send: (regIds: string[], data: PN.Data) => Promise<void>
  constructor(private opts: PusherOpts) {
    assert.isTypeOf(opts, PusherOptsV)
  }

  // public ping = async (opts: PushNotifierPingOpts) => this.notify({ ...opts, title: '', body: '' })

  public notify = async (opts: PushNotifierNotifyOpts): Promise<PNResult> => {
    const data: PN.Data = this.createPushData(opts)
    // created per notification to avoid maintaining a connection,
    // which hits issues when in AWS Lambda
    const send = createSend(this.opts)
    const result = await send(opts.deviceTokens, data)
    return (result as unknown) as PNResult
  }

  private createPushData = ({ title = '', body = '', badge }: PushNotifierNotifyOpts) => {
    return pickNonNull({
      title,
      body,
      contentAvailable: true,
      // iOS
      topic: this.opts.apn.appId,
      badge
    })
  }
}

export const createPushNotifier = (opts: PusherOpts) => new Pusher(opts)

/**
 * This is to avoid maintaining a connection,
 * which will be interrupted by the freeze of the container anyway
 */
export const createSend = (opts: PusherOpts) => {
  const { apn, gcm, production } = opts
  const client = new PN({
    gcm: {
      id: gcm.apiKey
    },
    apn: {
      cert: apn.cert,
      key: apn.key,
      production
    },
    // node-pushnotifications typings are not up to date
    // @ts-ignore
    web: {
      gcmAPIKey: gcm.apiKey,
      contentEncoding: 'aes128gcm',
      headers: {}
      // TTL: 2419200,
    }
  })

  const rawSend = promisify(client.send.bind(client))
  const cleanup = () => client.apn.shutdown()
  const send = (...args) => rawSend(...args).then(cleanup, cleanup)
  return send
}
