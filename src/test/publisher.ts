import './setup'

import test from 'tape'
import sinon from 'sinon'
import pick from 'lodash/pick'
import { loudAsync } from '../loud-async'
import { create as createPublisher } from '../domain/publisher'
import { Identity, ECPubKey } from '../types'
import * as crypto from '../crypto'
import { Publisher } from 'src/db/publisher'

// f u Prettier!
test(
  'create publisher',
  loudAsync(async (t: test.Test) => {
    const sandbox = sinon.createSandbox()
    const link = 'somelink'
    const challenge = 'somenonce'

    sandbox.stub(crypto, 'getObjectLink').returns(link)
    sandbox.stub(crypto, 'genChallengeForPublisher').returns(challenge)
    sandbox.stub(crypto, 'validateSig').resolves()

    const db = {
      register: async opts => {
        // TODO: actually validate
        t.same(opts, { challenge, link, key: pick(key, ['pub', 'curve']) })
      }
    } as Publisher

    const publisher = createPublisher({ db })
    const key = { pub: 'ha', curve: 'blah', ho: 'hey' } as ECPubKey
    const identity = { pubkeys: [key], _t: 'tradle.Identity' } as Identity

    const {} = await publisher.register({ identity, key })
    sandbox.restore()

    t.end()
  })
)
