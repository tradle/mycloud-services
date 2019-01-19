import { LogStore } from '@localtypes'

interface Context {
  store: LogStore
}

export interface SaveUserLogOpts {
  firstName: string
  lastName: string
  log: string
}

export const getISODate = () => new Date().toISOString()
export const getKeyForEvent = ({ firstName, lastName, log }: SaveUserLogOpts) =>
  `${getISODate()} ${firstName} ${lastName}.txt`

class UserLogs {
  private store: LogStore
  constructor({ store }: Context) {
    this.store = store
  }
  public put = async (opts: SaveUserLogOpts) => {
    await this.store.putUserLog(getKeyForEvent(opts), opts.log)
  }
}

export const create = (ctx: Context) => new UserLogs(ctx)
