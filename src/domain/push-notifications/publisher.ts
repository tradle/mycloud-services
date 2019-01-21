import { promisify } from 'util'
import pick from 'lodash/pick'
import * as t from 'io-ts'
import nkeyEC from 'nkey-ecdsa'
import { IdentityV, ECPubKeyV, ECPubKey, Models, PublisherDB } from '../../types'
import * as Errors from '../../errors'
import * as crypto from '../../crypto'
import * as assert from '../../assert'

export interface PublisherOpts {
  publisherDB: PublisherDB
  models: Models
}

export const RegisterPublisherOptsV = t.type({
  identity: IdentityV,
  key: ECPubKeyV
})

export type RegisterPublisherOpts = t.TypeOf<typeof RegisterPublisherOptsV>

export const ConfirmPublisherOptsV = t.type({
  nonce: t.string,
  salt: t.string,
  sig: t.string
})

export type ConfirmPublisherOpts = t.TypeOf<typeof ConfirmPublisherOptsV>

export const VerifyChallengeResponseOptsV = t.intersection([
  ConfirmPublisherOptsV,
  t.type({
    key: ECPubKeyV
  })
])

export type VerifyChallengeResponseOpts = t.TypeOf<typeof VerifyChallengeResponseOptsV>

export const NotifyOptsV = t.type({
  subscriber: t.string
})

export type NotifyOpts = t.TypeOf<typeof NotifyOptsV>

export const verifyChallengeResponse = async (opts: VerifyChallengeResponseOpts) => {
  const key = nkeyEC.fromJSON(opts.key)
  const { nonce, salt, sig } = opts
  const verify = promisify(key.verify.bind(key))
  const verified = await verify(crypto.sha256(nonce + salt), sig)
  if (!verified) {
    throw new Errors.InvalidSignature(`failed to confirm publisher`)
  }
}

export const genChallengeForPublisher = () => crypto.genNonce(32, 'base64')

export class Publisher {
  private db: PublisherDB
  private models: Models
  constructor({ publisherDB, models }: PublisherOpts) {
    this.db = publisherDB
    this.models = models
  }

  public register = async (opts: RegisterPublisherOpts) => {
    assert.isTypeOf(opts, RegisterPublisherOptsV)

    const { identity, key } = opts
    crypto.validateSig({ object: identity, identity })
    const link = crypto.getObjectLink(identity)
    const challenge = genChallengeForPublisher()
    await this.db.createChallenge({
      nonce: challenge,
      link,
      publisher: identity,
      key: pick(key, ['pub', 'curve']) as ECPubKey
    })

    return {
      challenge
    }
  }

  public confirm = async (opts: ConfirmPublisherOpts) => {
    assert.isTypeOf(opts, ConfirmPublisherOptsV)
    const { key, link } = await this.db.getChallenge(opts.nonce)

    // TODO: challenge should expire

    await verifyChallengeResponse({ key, ...opts })
    await this.db.createPublisher({ key, link })
  }

  public notify = async (opts: NotifyOpts) => {
    assert.isTypeOf(opts, NotifyOptsV)
    throw new Errors.NotImplemented('implement me!')
  }
}

export const create = (ctx: PublisherOpts) => new Publisher(ctx)
