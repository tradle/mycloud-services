import { RouterMiddleware as Middleware } from '../../../types'

export const create = (): Middleware => async (ctx, next) => {
  const { container, request } = ctx
  const { body } = request
  const { publishers } = container
  await publishers.register(body)
  // if ('sig' in body) {
  //   await publishers.confirm(body)
  // } else {
  //   await publishers.register(body)
  // }

  await next()
}
