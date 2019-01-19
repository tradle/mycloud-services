import { DB, Queries } from '../../types'
import * as Errors from '../../errors'

export const name = 'createSubscription'
export const wrap = (db: DB): Queries.CreateSubscription => async opts => {
  throw new Errors.NotImplemented('implement me!')
}
