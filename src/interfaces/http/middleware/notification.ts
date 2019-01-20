import { Middleware } from '../../../types'

export const create = (): Middleware => async (ctx, next) => {
  await ctx.container.publisher.notify(ctx.request.body)
  await next()
}
