import { DB, Queries } from '../../types'
import * as Errors from '../../errors'

export const name = 'addSubscriberDevice'
export const wrap = (db: DB): Queries.AddSubscriberDevice => async opts => {
  throw new Errors.NotImplemented('implement me!')
}
