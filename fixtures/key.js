const identity = require('./identity')

const key = identity.pubkeys.find(k => k.type === 'ec' && k.purpose === 'sign')
module.exports = key
