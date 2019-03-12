import Status from 'http-status'
import * as Errors from '@tradle/errors'
import { RouterMiddleware as Middleware } from '../../../types'
import CustomErrors from '../../../errors'

export const create = (): Middleware => async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    const { logger } = ctx.container
    logger.error(err)
    if (Errors.matches(err, [CustomErrors.UserError, CustomErrors.InvalidOption])) {
      ctx.status = Status.BAD_REQUEST
      ctx.body = { message: err.message }
      return
    }

    ctx.status = Status.INTERNAL_SERVER_ERROR
    ctx.body = { message: 'something went wrong' }
  }
}
