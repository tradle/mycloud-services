import { DB, Queries } from '../../types'
import * as Errors from '../../errors'

export const name = 'createPublisher'
export const wrap = (db: DB): Queries.CreatePublisher => async opts => {
  throw new Errors.NotImplemented('implement me!')
}
