import { RouterMiddleware as Middleware, PutUserLogOpts } from '../../../types'
import pick = require('lodash/pick')

export const create = (): Middleware => async (ctx, next) => {
  let opts: PutUserLogOpts

  const { container, headers, request, query } = ctx
  const { body } = request
  // if (headers['content-type'] === 'text') {
  //   opts = {
  //     firstName: query.firstName,
  //     lastName: query.lastName,
  //     log: rawBody
  //   }
  // } else {
  opts = pick(body, ['firstName', 'lastName', 'log']) as PutUserLogOpts
  // }

  await container.userLogs.put(opts)
  await next()
}
