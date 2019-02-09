import crypto, { HexBase64BinaryEncoding } from 'crypto'
import { LogStore, UserLogsOpts, PutUserLogOpts, PutUserLogOptsV } from '../../types'
import * as assert from '../../utils/assert'
import { toDateParts } from './date'

const randomString = (bytes: number, enc: HexBase64BinaryEncoding) => crypto.randomBytes(bytes).toString(enc)

export const getKeyForEvent = ({ firstName, lastName, log }: PutUserLogOpts) => {
  const { year, month, day, hour, minute, second } = toDateParts(new Date().getTime())
  const name = firstName && lastName ? `${firstName}-${lastName}` : firstName || lastName
  return `${year}-${month}-${day}/${hour}:00/${minute}:${second}:${name}.${randomString(6, 'hex')}.txt`
}

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

// export const parseLog = (log: string) => {
//   if (log.startsWith('"') && log.endsWith('"')) {
//     try {
//       const parsed = JSON.parse(log)
//       if (typeof parsed === 'string') return parsed
//     } catch (err) {}
//   }

//   return log
// }

export const create = (ctx: UserLogsOpts) => new UserLogs(ctx)
