import { DB } from '../types'

export interface Context {
  db: DB
}

export interface CreateNotificationOpts {}

export const create = (ctx: Context) => async (opts: CreateNotificationOpts) => {}
