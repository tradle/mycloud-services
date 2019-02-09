import { RouterMiddleware as Middleware, Subscription } from '../../../types'

export const create = (): Middleware => async (ctx, next) => {
  await ctx.container.subscribers.createSubscription({
    subscription: ctx.request.body as Subscription
  })

  await next()
}
