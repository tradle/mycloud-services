
require('../source-map-install')

export const createLocalConfig = () => ({
  local: true,
})

export const createRemoteConfig = () => ({
  local: false,
})

export const config = process.env.SERVERLESS_OFFLINE ? createLocalConfig() : createRemoteConfig()
