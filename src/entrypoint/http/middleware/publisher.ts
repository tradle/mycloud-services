import { RouterMiddleware as Middleware } from '../../../types'

export const create = (): Middleware => async (ctx, next) => {
  const { container, request } = ctx
  const { body } = request
  const { publisher } = container
  if ('sig' in body) {
    await publisher.confirm(body)
  } else {
    await publisher.register(body)
  }

  await next()
}
