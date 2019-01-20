import { Middleware } from '../../../types'

export const create = (): Middleware => async (ctx, next) => {
  await ctx.container.subscriber.clearBadge(ctx.request.body)
  await next()
}
