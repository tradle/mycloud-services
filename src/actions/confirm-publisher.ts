import { DB } from '../types'

export interface Context {
  db: DB
}

export interface ConfirmPublisherOpts {
  nonce: string
  salt: string
  sig: string
}

export const create = (ctx: Context) => async (opts: ConfirmPublisherOpts) => {}
