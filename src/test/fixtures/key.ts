import identity from './identity'

const key = identity.pubkeys.find(k => k.type === 'ec' && k.purpose === 'sign')
export = key
