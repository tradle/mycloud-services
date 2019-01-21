import { RouterMiddleware as Middleware } from '../../../types'

export const create = (): Middleware => async (ctx, next) => {
  await ctx.container.userLogs.put({
    firstName: ctx.query.firstName,
    lastName: ctx.query.lastName,
    log: ctx.request.body
  })

  await next()
}
