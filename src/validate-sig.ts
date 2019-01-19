import { promisify } from 'util'
import { createValidator } from '@tradle/engine'

const validator = createValidator()
const checkAuthentic = promisify(validator.checkAuthentic)

export const validateSig = ({ object, identity }): Promise<void> =>
  checkAuthentic({
    object,
    author: { object: identity }
  })
