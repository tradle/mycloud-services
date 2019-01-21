import * as t from 'io-ts'
import { LogStore } from '../../types'
import * as assert from '../../assert'

interface UserLogsOpts {
  store: LogStore
}

const PutUserLogOptsV = t.type({
  firstName: t.string,
  lastName: t.string,
  log: t.string
})

type PutUserLogOpts = t.TypeOf<typeof PutUserLogOptsV>

export const getISODate = () => new Date().toISOString()
export const getKeyForEvent = ({ firstName, lastName, log }: PutUserLogOpts) =>
  `${getISODate()} ${firstName} ${lastName}.txt`

export class UserLogs {
  private store: LogStore
  constructor({ store }: UserLogsOpts) {
    this.store = store
  }
  public put = async (opts: PutUserLogOpts) => {
    assert.isTypeOf(opts, PutUserLogOptsV)
    await this.store.put(getKeyForEvent(opts), opts.log)
  }
}

export const create = (ctx: UserLogsOpts) => new UserLogs(ctx)
