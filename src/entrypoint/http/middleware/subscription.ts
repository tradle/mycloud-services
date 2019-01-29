import { RouterMiddleware as Middleware } from '../../../types'

export const create = (): Middleware => async (ctx, next) => {
  await ctx.container.subscribers.createSubscription(ctx.request.body)
  await next()
}
