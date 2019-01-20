import { Middleware } from 'koa-compose'
import { Context } from 'koa'
import { Container } from '../../../types'

export const create = (container: Container): Middleware<Context> => (ctx, next) => {
  ctx.container = container
  return next()
}
