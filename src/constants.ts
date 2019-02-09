export const PUSH_PROTOCOLS = ['apns', 'gcm']
export type PushProtocol = 'apns' | 'gcm'
export const TYPES = {
  DEVICE_REGISTRATION: 'tradle.services.PNSRegistration',
  SUBSCRIBER: 'tradle.services.PNSSubscriber',
  SUBSCRIPTION: 'tradle.services.PNSSubscription',
  PUBLISHER: 'tradle.services.PNSPublisher'
}

export const FUNCTIONS = {
  saveUserLog: 'saveUserLog',
  registerDevice: 'registerDevice',
  subscribe: 'subscribe',
  notify: 'notify',
  clearBadge: 'clearBadge'
}
