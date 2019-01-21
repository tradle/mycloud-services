import Status from 'http-status'
import { RouterMiddleware as Middleware } from '../../../types'
import * as Errors from '../../../errors'

export const create = (): Middleware => async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    const { logger } = ctx.container
    logger.error(err)
    if (err instanceof Errors.UserError) {
      ctx.status = Status.BAD_REQUEST
      ctx.body = { message: err.message }
      return
    }

    ctx.status = Status.INTERNAL_SERVER_ERROR
    ctx.body = { message: 'something went wrong' }
  }
}
