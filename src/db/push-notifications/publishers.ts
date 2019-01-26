import omit from 'lodash/omit'
import buildResource from '@tradle/build-resource'
import { DBHandle, Identity, Models } from '../../types'

interface PublisherOpts {
  db: DBHandle
  models: Models
}

interface ECPubKey {
  pub: string
  curve: string
}

export interface CreateChallengeOpts {
  nonce: string
  link: string
  key: ECPubKey
  publisher: Identity
}

export interface CreatePublisherOpts {
  link: string
  key: ECPubKey
}

const T_PUBLISHER_CHALLENGE = 'tradle.PNSPublisherChallenge'
const T_PUBLISHER = 'tradle.PNSPublisher'

const unserializeResource = resource => omit(resource, ['_t'])
const unserializeChallenge = unserializeResource
const serializePublisher = ({ key, link }: CreatePublisherOpts) => ({ _t: T_PUBLISHER, key, link })

export class Publisher {
  private db: DBHandle
  private models: Models
  constructor({ db, models }: PublisherOpts) {
    this.db = db
    this.models = models
  }

  public createChallenge = async (opts: CreateChallengeOpts) => {
    const serialized = this.serializeChallenge(opts)
    await this.db.put(serialized)
  }

  public getChallenge = async (nonce: string) => {
    const serialized = await this.db.get({
      _t: T_PUBLISHER_CHALLENGE,
      nonce
    })

    return unserializeChallenge(serialized)
  }

  public createPublisher = async (opts: CreatePublisherOpts) => {
    await this.db.put(serializePublisher(opts))
  }

  // doesn't really belong here
  private serializeChallenge = ({ nonce, key, publisher }: CreateChallengeOpts) => {
    const publisherStub = buildResource.stub({
      models: this.models,
      resource: publisher
    })

    return {
      _t: T_PUBLISHER_CHALLENGE,
      nonce,
      key,
      publisher: publisherStub
    }
  }
}

export const create = (ctx: PublisherOpts) => new Publisher(ctx)
