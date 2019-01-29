import AWS from 'aws-sdk'
import { localstack } from './localstack'
export const targetLocalstack = () => {
  for (const service in localstack) {
    const lowercase = service.toLowerCase()
    AWS.config.update({
      [service]: {
        endpoint: localstack[service]
      }
    })
  }
}
