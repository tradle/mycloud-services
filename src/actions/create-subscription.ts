import { DB, SignedTradleObject } from '../types'

export interface Context {
  db: DB
}

export interface CreateSubscriptionOpts extends SignedTradleObject {
  publisher: string
  subscriber: string
}

export const createHandler = (ctx: Context) => async (opts: CreateSubscriptionOpts) => {}
