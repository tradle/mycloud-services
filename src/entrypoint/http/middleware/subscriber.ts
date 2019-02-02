import { RouterMiddleware as Middleware, SignedDevice } from '../../../types'

export const create = (): Middleware => async (ctx, next) => {
  const { subscribers } = ctx.container
  const { subscriber } = ctx.request.body
  subscribers.validateSubscriber(subscriber)
  await subscribers.registerDevice({ device: ctx.request.body as SignedDevice })
  await next()
}
