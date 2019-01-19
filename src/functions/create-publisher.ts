import { wrapHandler } from '../apigw-lambda'
import { create as createRegHandler, CreatePublisherOpts } from '../actions/create-publisher'
import { create as createConfirmHandler, ConfirmPublisherOpts } from '../actions/confirm-publisher'
import { createContext } from '../create-context'
import * as Errors from '../errors'

const context = createContext()
const regHandler = createRegHandler(context)
const confirmHandler = createConfirmHandler(context)

export const handler = wrapHandler(({ body }) => {
  if (!body) throw new Errors.InvalidOption(`request is missing body`)

  if ('sig' in body) {
    return confirmHandler((body as unknown) as ConfirmPublisherOpts)
  }

  return regHandler((body as unknown) as CreatePublisherOpts)
})
