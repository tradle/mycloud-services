import { IMiddleware } from 'koa-router'
import { Container } from '../../../types'

export const create = (container: Container): IMiddleware => async (ctx, next) => {
  await container.ready
  ctx.container = container
  return next()
}
