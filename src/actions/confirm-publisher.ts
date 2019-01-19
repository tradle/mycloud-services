import { DB } from '../types'

export interface Context {
  db: DB
}

export interface ConfirmPublisherOpts {
  nonce: string
  salt: string
  sig: string
}

export const createHandler = (ctx: Context) => async (opts: ConfirmPublisherOpts) => {}
