import { DB, SignedTradleObject } from '../types'

export interface Context {
  db: DB
}

export interface CreateSubscriptionOpts extends SignedTradleObject {
  publisher: string
  subscriber: string
}

export const create = ({ db }: Context) => async (opts: CreateSubscriptionOpts) => {
  // your code here
  //
  // await db.createSubscription(...)
}
