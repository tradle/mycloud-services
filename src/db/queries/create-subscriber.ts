import { DB, Queries } from '../../types'
import * as Errors from '../../errors'

export const name = 'createSubscriber'
export const wrap = (db: DB): Queries.CreateSubscriber => async opts => {
  throw new Errors.NotImplemented('implement me!')
}
