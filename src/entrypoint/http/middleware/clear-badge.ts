import { RouterMiddleware as Middleware } from '../../../types'

export const create = (): Middleware => async (ctx, next) => {
  await ctx.container.subscribers.clearBadge(ctx.request.body)
  await next()
}
