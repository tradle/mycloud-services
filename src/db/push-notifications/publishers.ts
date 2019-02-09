import omit from 'lodash/omit'
import buildResource from '@tradle/build-resource'
import * as Errors from '@tradle/errors'
import { DBHandle, Identity, Models, RegisterPublisherOpts } from '../../types'

interface PublisherOpts {
  db: DBHandle
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

const TYPES = {
  PUBLISHER: 'tradle.PNSPublisher',
  FRIEND: 'tradle.MyCloudFriend'
}

export class Publishers {
  private db: DBHandle
  constructor({ db }: PublisherOpts) {
    this.db = db
  }

  public getPublisher = async (permalink: string) => {
    return this.db.matchOne(TYPES.FRIEND, {
      'identity._permalink': permalink
    })
  }

  public getPublisherName = async (permalink: string) => {
    const { name } = await this.getPublisher(permalink)
    return name
  }

  // public createPublisher = async (opts: CreatePublisherOpts) => {
  //   await this.db.put({ _t: T_PUBLISHER, ...opts })
  // }

  // public getPublisher = async (opts: GetPublisherOpts) => {
  //   return await this.db.findOne({ _t: T_PUBLISHER, ...opts })
  // }
  // public publisherExists = async (opts: GetPublisherOpts) => {
  //   try {
  //     await this.getPublisher(opts)
  //     return false
  //   } catch (err) {
  //     Errors.ignore(err, Errors.NotFound)
  //     return false
  //   }
  // }
}

export const create = (ctx: PublisherOpts) => new Publishers(ctx)
