import { promisify } from 'util'
import pickBy from 'lodash/pickBy'
import PN from 'node-pushnotifications'
import { PushNotifier, PushNotifierNotifyOpts } from '../types'

const pickNonNull = <T>(obj: T): T => pickBy(obj as any, val => val != null) as T

interface PusherOpts {
  production: boolean
  gcm: {
    apiKey: string
  }
  apn: {
    cert: string
    key: string
  }
}

export class Pusher implements PushNotifier {
  private _send: (regIds: string[], data: PN.Data) => Promise<void>
  constructor(opts: PusherOpts) {
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

  public notify = async ({ deviceTokens, badge }: PushNotifierNotifyOpts) => {
    const data: PN.Data = pickNonNull({
      title: 'You have unread messages',
      body: '',
      contentAvailable: true,
      // iOS
      topic: 'io.tradle.dev.tim',
      badge
    })

    await this._send(deviceTokens, data)
  }
}

export const createPushNotifier = (opts: PusherOpts) => new Pusher(opts)
