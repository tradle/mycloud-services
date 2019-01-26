import AWS from 'aws-sdk'
import { regions } from './regions'
import { SNSClients } from '../../../types'

export const createRegionalClients = (baseOpts: AWS.SNS.Types.ClientConfiguration) => {
  const byRegion: SNSClients = {}
  regions.forEach(region => {
    let cached
    Object.defineProperty(this.byRegion, region, {
      enumerable: true,
      get() {
        if (!cached) {
          cached = new AWS.SNS({ ...baseOpts, region })
        }

        return cached
      }
    })
  })

  return byRegion
}
