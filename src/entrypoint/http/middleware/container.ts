import { IMiddleware } from 'koa-router'
import { Container } from '../../../types'

export const create = (container: Container): IMiddleware => (ctx, next) => {
  ctx.container = container
  return next()
}
