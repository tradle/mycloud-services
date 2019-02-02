require('../../../source-map-install')

import test from 'blue-tape'
import sinon from 'sinon'
import pick from 'lodash/pick'
import { loudAsync } from '../../utils/loud-async'
import { create as createPublishers, Publishers } from './publishers'
import { Identity, ECPubKey, PublishersDB } from '../../types'
import models from '../../models'
import * as assert from '../../utils/assert'
import { Subscribers } from './subscribers'

// f u Prettier!
test(
  'create publisher',
  loudAsync(async (t: test.Test) => {
    // const sandbox = sinon.createSandbox()
    // const publishersDB = {} as PublishersDB
    // const publishers = createPublishers({
    //   publishersDB,
    //   subscribers: null,
    //   models,
    //   createPublisherTopicName: null,
    //   pubSub: null,
    //   notificationsTarget: null,
    //   pushNotifier: null
    // })
    // await publishers.register({
    //   accountId: 'accountId1',
    //   permalink: 'abc',
    //   region: 'us-east-2'
    // })
    // publishers.notify
  })
)
