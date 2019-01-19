import { KeyValueStore } from './types'

interface CreateStoreOpts {
  client: AWS.S3
  prefix: string
}

const parsePrefix = (prefix: string) => {
  prefix.replace(/\/+$/, '')
  const slashIdx = prefix.indexOf('/')
  if (slashIdx === -1) {
    return {
      bucket: prefix,
      keyPrefix: ''
    }
  }

  return {
    bucket: prefix.slice(0, slashIdx),
    keyPrefix: prefix.slice(slashIdx + 1)
  }
}

export const createStore = ({ client, prefix }: CreateStoreOpts): KeyValueStore => {
  const { bucket, keyPrefix } = parsePrefix(prefix)
  const getOptsForKey = key => ({
    Bucket: bucket,
    Key: keyPrefix ? `${keyPrefix}/${key}` : key
  })

  const get = async (key: string) => {
    return client.getObject(getOptsForKey(key)).promise()
  }

  const put = async (key: string, value: any) => {
    await client
      .putObject({
        ...getOptsForKey(key),
        Body: JSON.stringify(value),
        ContentType: 'application/json'
      })
      .promise()
  }

  return { get, put }
}
