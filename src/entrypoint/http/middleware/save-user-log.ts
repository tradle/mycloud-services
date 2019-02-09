import { RouterMiddleware as Middleware, PutUserLogOpts } from '../../../types'
import pick = require('lodash/pick')

export const create = (): Middleware => async (ctx, next) => {
  let opts: PutUserLogOpts

  const { headers, request, query } = ctx
  const { body } = request
  // if (headers['content-type'] === 'text') {
  //   opts = {
  //     firstName: query.firstName,
  //     lastName: query.lastName,
  //     log: body
  //   }
  // } else {
  opts = pick(ctx.request.body, ['firstName', 'lastName', 'log']) as PutUserLogOpts
  // }

  await ctx.container.userLogs.put(opts)
  await next()
}
