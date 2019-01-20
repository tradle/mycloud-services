import { LogStore } from '@localtypes'

interface UserLogsOpts {
  store: LogStore
}

export interface PutUserLogOpts {
  firstName: string
  lastName: string
  log: string
}

export const getISODate = () => new Date().toISOString()
export const getKeyForEvent = ({ firstName, lastName, log }: PutUserLogOpts) =>
  `${getISODate()} ${firstName} ${lastName}.txt`

export class UserLogs {
  private store: LogStore
  constructor({ store }: UserLogsOpts) {
    this.store = store
  }
  public put = async (opts: PutUserLogOpts) => {
    await this.store.put(getKeyForEvent(opts), opts.log)
  }
}

export const create = (ctx: UserLogsOpts) => new UserLogs(ctx)
