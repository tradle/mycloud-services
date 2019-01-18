import { DB, Identity, PublicKey } from './types'

interface CreatePublisherOpts {
  identity: Identity
  key: PublicKey
}

export const createPublisher = (ctx: Context) => async ({ identity, key }: CreatePublisherOpts) => {

}
