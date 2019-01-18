
import { localstack } from './localstack'
import { CloudEndpointType } from './types'

interface GetServiceOptionsOpts {
  endpointType: CloudEndpointType
  service: string
}

export const getServiceOptions = ({ endpointType, service }: GetServiceOptionsOpts) => {
  if (endpointType === CloudEndpointType.localstack) {
    return {
      endpoint: localstack[service],
    }
  }

  return {}
}
