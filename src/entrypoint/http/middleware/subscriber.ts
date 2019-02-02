import { RouterMiddleware as Middleware } from '../../../types'
import { SignedDevice } from 'src/domain/push-notifications/subscribers'

export const create = (): Middleware => async (ctx, next) => {
  const { subscribers } = ctx.container
  const { subscriber } = ctx.request.body
  subscribers.validateSubscriber(subscriber)
  await subscribers.registerDevice({ device: ctx.request.body as SignedDevice })
  await next()
}
