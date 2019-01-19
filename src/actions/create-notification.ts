import { DB } from '../types'

export interface Context {
  db: DB
}

export interface CreateNotificationOpts {}

export const createHandler = (ctx: Context) => async (opts: CreateNotificationOpts) => {}
