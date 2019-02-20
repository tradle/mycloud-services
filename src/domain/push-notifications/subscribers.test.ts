require('../../../source-map-install')

import test from 'blue-tape'
import Errors from '../../errors'
import { loudAsync } from '../../utils/loud-async'
import { create as createSubscribers } from './subscribers'
import { SubscribersDB, Subscriber, Subscription, Device, SignedDevice } from '../../types'
import subscriberIdentity from '../../../fixtures/identity'
import * as constants from '../../constants'
// import { serializeDevice, unserializeDevice } from '../../db/push-notifications/subscribers'

// test('un/serialize device', t => {
//   const device: Device = {
//     protocol: 'apns',
//     token: 'abc'
//   }

//   const deviceStr = serializeDevice(device)
//   t.equal(deviceStr, 'apns:abc')
//   t.deepEqual(unserializeDevice(deviceStr), device)

//   t.end()
// })

// f u Prettier!
test(
  'register/add device',
  loudAsync(async (t: test.Test) => {
    const device1: SignedDevice = {
      _t: constants.TYPES.DEVICE_REGISTRATION,
      _s: '',
      identity: subscriberIdentity,
      token: 'abc',
      protocol: 'apns'
    }

    const device2: SignedDevice = {
      ...device1,
      token: 'efg',
      protocol: 'gcm'
    }

    // @ts-ignore
    const subscribersDB = {
      getSubscriber: async opts => {
        if (subscriber) return subscriber

        throw new Errors.NotFound(`subscriber ${opts.permalink}`)
      },
      updateSubscriber: async sub => {
        subscriber = sub
      }
    } as SubscribersDB

    let subscriber: Subscriber
    const subscribers = createSubscribers({ subscribersDB })
    await subscribers.registerDevice({ device: device1 })
    t.deepEqual(subscriber, await subscribers.getSubscriber({ permalink: subscriber.permalink }))
    t.equal(subscriber.devices[0].token, device1.token)
    t.equal(subscriber.permalink, 'f593c5bec9977f7179aa08fed36d08f87721122ee36c06544154d0d387100a22')

    await subscribers.registerDevice({ device: device2 })
    t.deepEqual(subscriber, await subscribers.getSubscriber({ permalink: subscriber.permalink }))
    t.equal(subscriber.devices[1].token, device2.token)
    t.equal(subscriber.permalink, 'f593c5bec9977f7179aa08fed36d08f87721122ee36c06544154d0d387100a22')
  })
)

test(
  'create subscription',
  loudAsync(async t => {
    let subscriber = {} as Subscriber
    const subscribers = createSubscribers({
      subscribersDB: {
        getSubscriber: async opts => {
          return subscriber
        },
        updateSubscriber: async update => {
          subscriber = update
        }
      } as SubscribersDB
    })

    await subscribers.createSubscription({
      subscription: {
        publisher: 'abc'
      } as Subscription
    })

    t.deepEqual(subscriber.subscriptions, ['abc'])

    await subscribers.createSubscription({
      subscription: {
        publisher: 'efg'
      } as Subscription
    })

    t.deepEqual(subscriber.subscriptions, ['abc', 'efg'])
  })
)
