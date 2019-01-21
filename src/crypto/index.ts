import crypto from 'crypto'
import tradle from '@tradle/protocol'

export { validateSig } from './validate-sig'
export const genNonce = (bytes: number, encoding = 'base64') => crypto.randomBytes(32).toString(encoding)
export const getObjectLink = object => tradle.linkString(object)
export const sha256 = (data: string) =>
  crypto
    .createHash('sha256')
    .update(data)
    .digest('base64')
