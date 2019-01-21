import { RouterMiddleware as Middleware } from '../../../types'

export const create = (): Middleware => async (ctx, next) => {
  await ctx.container.subscriber.create(ctx.request.body)
  await next()
}
