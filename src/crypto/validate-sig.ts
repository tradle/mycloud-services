import { promisify } from 'util'
import tradle from '@tradle/engine'
import * as Errors from '../errors'
import { Identity, SignedTradleObject } from '../types'

const validator = tradle.validator()
const checkAuthentic = promisify(validator.checkAuthentic)

interface ValidateSigOpts {
  object: SignedTradleObject
  identity: Identity
}

export const validateSig = async ({ object, identity }: ValidateSigOpts): Promise<void> => {
  try {
    await checkAuthentic({
      object,
      author: { object: identity }
    })
  } catch (err) {
    throw new Errors.InvalidSignature(`invalid signature on ${object._t}`)
  }
}
