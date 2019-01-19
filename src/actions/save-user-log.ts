import { LogStore } from '../types'

export interface Context {
  logStore: LogStore
}

export interface SaveUserLogOpts {
  firstName: string
  lastName: string
  log: string
}

export const getISODate = () => new Date().toISOString()
export const getKeyForEvent = ({ firstName, lastName, log }: SaveUserLogOpts) =>
  `${getISODate()} ${firstName} ${lastName}.txt`

export const createHandler = ({ logStore }: Context) => async (opts: SaveUserLogOpts) => {
  await logStore.putUserLog(getKeyForEvent(opts), opts.log)
}
