import { promisify } from 'util'
import pickBy from 'lodash/pickBy'
import PN from 'node-pushnotifications'
import { PushNotifier, PushNotifierNotifyOpts } from '../types'

const pickNonNull = <T>(obj: T): T => pickBy(obj as any, val => val != null) as T

interface PusherOpts {
  production: boolean
  gcm?: {
    apiKey: string
  }
  apn?: {
    cert: string
    key: string
    appId: string
  }
}

export class Pusher implements PushNotifier {
  private _send: (regIds: string[], data: PN.Data) => Promise<void>

  constructor(private opts: PusherOpts) {
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

    this._send = promisify(client.send.bind(client))
  }

  // public ping = async (opts: PushNotifierPingOpts) => this.notify({ ...opts, title: '', body: '' })

  public notify = async (opts: PushNotifierNotifyOpts) => {
    const data: PN.Data = this.createPushData(opts)
    await this._send(opts.deviceTokens, data)
  }

  private createPushData = ({ title = '', body = '', deviceTokens, badge }: PushNotifierNotifyOpts) => {
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
