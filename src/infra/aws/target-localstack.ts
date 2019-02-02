import AWS from 'aws-sdk'
import { localstack } from './localstack'
export const targetLocalstack = () => {
  for (const service in localstack) {
    const lowercase = service.toLowerCase()
    AWS.config.update({
      [lowercase]: {
        endpoint: localstack[service]
      }
    })
  }

  AWS.config.update({
    s3: {
      s3ForcePathStyle: true,
      endpoint: localstack.S3
    }
  })
}
