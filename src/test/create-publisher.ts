import './setup'

import test from 'tape'
import sinon from 'sinon'
import pick from 'lodash/pick'
import { loudAsync } from '../loud-async'
import { create } from '../actions/create-publisher'
import { DB, Identity, PublicKey } from '../types'
import * as crypto from '../crypto'

// f u Prettier!
test(
  'create-publisher',
  loudAsync(async (t: test.Test) => {
    const sandbox = sinon.createSandbox()
    const link = 'somelink'
    const nonce = 'somenonce'

    sandbox.stub(crypto, 'getObjectLink').returns(link)
    sandbox.stub(crypto, 'genNonceForPublisher').returns(nonce)
    sandbox.stub(crypto, 'validateSig').resolves()

    const db = {
      createPublisher: async opts => {
        // TODO: actually validate
        t.same(opts, { nonce, link, key: pick(key, ['pub', 'curve']) })
      }
    } as DB

    const createPublisher = create({ db })
    const key: PublicKey = { pub: 'ha', curve: 'blah', ho: 'hey' }
    const identity = { pubkeys: [key], _t: 'tradle.Identity' } as Identity

    await createPublisher({ identity, key })
    sandbox.restore()

    t.end()
  })
)
