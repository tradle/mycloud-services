import { wrapHandler } from '../apigw-lambda'
import { createHandler as createRegHandler, CreatePublisherOpts } from '../actions/create-publisher'
import { createHandler as createConfirmHandler, ConfirmPublisherOpts } from '../actions/confirm-publisher'
import { createContext } from '../create-context'
import { createConfig } from '../config'
import * as Errors from '../errors'

const config = createConfig()
const context = createContext(config)
const regHandler = createRegHandler(context)
const confirmHandler = createConfirmHandler(context)

export const handler = wrapHandler(({ body }) => {
  if (!body) throw new Errors.InvalidOption(`request is missing body`)

  if ('sig' in body) {
    return confirmHandler((body as unknown) as ConfirmPublisherOpts)
  }

  return regHandler((body as unknown) as CreatePublisherOpts)
})
