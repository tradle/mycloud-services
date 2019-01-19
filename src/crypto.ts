import crypto from 'crypto'
import tradle from '@tradle/protocol'

export { validateSig } from './validate-sig'
export const genNonce = (bytes: number, encoding = 'base64') => crypto.randomBytes(32).toString(encoding)
export const genChallengeForPublisher = () => genNonce(32, 'base64')
export const getObjectLink = object => tradle.linkString(object)
