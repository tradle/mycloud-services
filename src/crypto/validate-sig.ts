import { promisify } from 'util'
import tradle from '@tradle/engine'
import Errors from '../errors'
import { Identity, SignedTradleObject } from '../types'

const validator = tradle.validator()
const checkAuthentic = promisify(validator.checkAuthentic)

interface Author {
  object: Identity
  permalink?: string
  link?: string
}

interface ValidateSigOpts {
  object: SignedTradleObject
  author: Author
}

export const validateSig = async ({ object, author }: ValidateSigOpts): Promise<void> => {
  try {
    await checkAuthentic({ object, author })
  } catch (err) {
    throw new Errors.InvalidSignature(`invalid signature on ${object._t}`)
  }
}
