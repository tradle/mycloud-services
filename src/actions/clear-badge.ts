import { Context, DB } from '../types'

export interface Context {
  db: DB
}

export interface ClearBadgeOpts {
  subscriber: string
}

export const create = (ctx: Context) => async (opts: ClearBadgeOpts) => {}
