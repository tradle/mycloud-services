import crypto, { HexBase64BinaryEncoding } from 'crypto'
import { LogStore, UserLogsOpts, PutUserLogOpts, PutUserLogOptsV } from '../../types'
import * as assert from '../../utils/assert'

const randomString = (bytes: number, enc: HexBase64BinaryEncoding) => crypto.randomBytes(bytes).toString(enc)
export const getISODate = () => new Date().toISOString()
export const getKeyForEvent = ({ firstName, lastName, log }: PutUserLogOpts) =>
  `${getISODate()}-r${randomString(6, 'hex')} ${firstName} ${lastName}.txt`

export class UserLogs {
  private store: LogStore
  constructor({ store }: UserLogsOpts) {
    this.store = store
  }
  public put = async (opts: PutUserLogOpts) => {
    assert.isTypeOf(opts, PutUserLogOptsV)
    const key = getKeyForEvent(opts)
    await this.store.put(key, opts.log)
  }
}

export const create = (ctx: UserLogsOpts) => new UserLogs(ctx)
