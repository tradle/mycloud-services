export const PUSH_PROTOCOLS = ['apns', 'gcm']
export type PushProtocol = 'apns' | 'gcm'
export const TYPES = {
  DEVICE_REGISTRATION: 'tradle.services.PNSRegistration',
  SUBSCRIBER: 'tradle.services.PNSSubscriber',
  SUBSCRIPTION: 'tradle.services.PNSSubscription',
  PUBLISHER: 'tradle.services.PNSPublisher'
}
