import './setup'

import test from 'tape'
import sinon from 'sinon'
import pick from 'lodash/pick'
import { loudAsync } from '../loud-async'
import { create as createPublisher } from '../domain/push-notifications/publisher'
import { Identity, ECPubKey } from '../types'
import * as crypto from '../crypto'
import { Publisher } from '../db/push-notifications/publisher'
import models from '../models'
import * as assert from '../assert'

// f u Prettier!
test(
  'create publisher',
  loudAsync(async (t: test.Test) => {
    const sandbox = sinon.createSandbox()
    const link = 'somelink'
    const challenge = 'somenonce'

    sandbox.stub(crypto, 'getObjectLink').returns(link)
    sandbox.stub(crypto, 'genNonce').returns(challenge)
    sandbox.stub(crypto, 'validateSig').resolves()
    sandbox.stub(assert, 'isTypeOf').returns()

    const publisherDB = {
      createChallenge: async opts => {
        t.same(opts, { nonce: challenge, link, publisher: identity, key })
      },
      createPublisher: async opts => {
        // TODO: actually validate
        t.same(opts, { challenge, link, key: pick(key, ['pub', 'curve']) })
      }
    } as Publisher

    const publisher = createPublisher({ publisherDB, models })
    const key: ECPubKey = { pub: 'ha', curve: 'blah' }
    const identity = { pubkeys: [key], _t: 'tradle.Identity' } as Identity

    const {} = await publisher.register({ identity, key })
    sandbox.restore()

    t.end()
  })
)
