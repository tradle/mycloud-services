import { RouterMiddleware as Middleware } from '../../../types'

export const create = (): Middleware => async (ctx, next) => {
  await ctx.container.publishers.notify(ctx.request.body)
  await next()
}
