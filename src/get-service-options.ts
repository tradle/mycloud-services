
import { localstack } from './localstack'

interface GetServiceOptionsOpts {
  local: boolean
  service: string
}

export const getServiceOptions = ({ local, service }: GetServiceOptionsOpts) => {
  if (local) {
    return {
      endpoint: localstack[service],
    }
  }

  return {}
}
