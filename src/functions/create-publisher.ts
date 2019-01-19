import { wrapHandler } from '../apigw-lambda'
import { create as createPublisher } from '../domain/publisher'
import { create as createContext } from '../context'
import * as Errors from '../errors'

const publisher = createPublisher(createContext())

export const handler = wrapHandler(async ({ body }) => {
  if (!body) throw new Errors.InvalidOption(`request is missing body`)

  if ('sig' in body) {
    return publisher.confirm(body as any)
  }

  const { challenge } = await publisher.register(body as any)
  return challenge
})
