import { queries } from './queries'
import { DBHandle, DB } from '../types'

export const createClient = (db: DBHandle): DB => {
  const client = {} as DB
  for (let query in queries) {
    client[query] = queries[query](db)
  }

  return client
}
