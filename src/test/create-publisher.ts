import test from 'tape'
import { loudAsync } from '../loud-async'
import { createHandler } from '../actions/create-publisher'
import { DB, Identity, PublicKey } from '../types'

// f u Prettier!
test(
  'create-publisher',
  loudAsync(async (t: test.Test) => {
    const db = {
      createPublisher: async opts => {
        // TODO: actually validate
        t.same(opts, {})
      }
    } as DB

    const createPublisher = createHandler({ db })
    await createPublisher({
      identity: {} as Identity,
      key: {} as PublicKey
    })
  })
)
