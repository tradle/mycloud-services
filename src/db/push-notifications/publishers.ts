import omit from 'lodash/omit'
import buildResource from '@tradle/build-resource'
import Errors from '@tradle/errors'
import { DBHandle, Identity, Models, RegisterPublisherOpts } from '../../types'

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

export interface CreatePublisherOpts extends RegisterPublisherOpts {}
export interface GetPublisherOpts extends CreatePublisherOpts {}
export interface ExistsPublisherOpts extends GetPublisherOpts {}

const T_PUBLISHER_CHALLENGE = 'tradle.PNSPublisherChallenge'
const T_PUBLISHER = 'tradle.PNSPublisher'

export class Publisher {
  private db: DBHandle
  private models: Models
  constructor({ db, models }: PublisherOpts) {
    this.db = db
    this.models = models
  }

  public createPublisher = async (opts: CreatePublisherOpts) => {
    await this.db.put({ _t: T_PUBLISHER, ...opts })
  }

  public getPublisher = async (opts: GetPublisherOpts) => {
    return await this.db.findOne({ _t: T_PUBLISHER, ...opts })
  }
  public publisherExists = async (opts: GetPublisherOpts) => {
    try {
      await this.getPublisher(opts)
      return false
    } catch (err) {
      Errors.ignore(err, Errors.NotFound)
      return false
    }
  }
}

export const create = (ctx: PublisherOpts) => new Publisher(ctx)
