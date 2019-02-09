import { RouterMiddleware as Middleware, SignedDevice } from '../../../types'

export const create = (): Middleware => async (ctx, next) => {
  const { subscribers } = ctx.container
  const device = ctx.request.body as SignedDevice
  await subscribers.validateDevice({ device })
  await subscribers.registerDevice({ device })
  await next()
}
