import { KeyValueStore } from '../../types'

interface CreateStoreOpts {
  client: AWS.S3
  prefix: string
  defaultPutOpts?: Partial<AWS.S3.PutObjectRequest>
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

export const createStore = ({ client, prefix, defaultPutOpts = {} }: CreateStoreOpts): KeyValueStore => {
  const { bucket, keyPrefix } = parsePrefix(prefix)
  const getOptsForKey = key => ({
    Bucket: bucket,
    Key: keyPrefix ? `${keyPrefix}/${key}` : key
  })

  const get = async (key: string) => {
    const opts = getOptsForKey(key)
    return client.getObject(opts).promise()
  }

  const put = async (key: string, value: any) => {
    const opts = {
      ...defaultPutOpts,
      ...getOptsForKey(key),
      Body: JSON.stringify(value)
      // ContentType: 'application/json'
    }

    await client.putObject(opts).promise()
  }

  return { get, put }
}
