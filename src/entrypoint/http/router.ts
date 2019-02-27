Error.stackTraceLimit = Infinity

import Koa from 'koa'
import Router from 'koa-router'
import cors from 'kcors'
import bodyParser from 'koa-bodyparser'
import compression from 'koa-compress'
import { Config, RouterMiddleware as Middleware } from '../../types'
import { loadMiddleware } from './load-middleware'

interface RouterOpts {
  config: Config
  containerMiddleware: Middleware
}

export const createRouter = ({ config, containerMiddleware }: RouterOpts) => {
  const koa = new Koa()
  const router = new Router()

  // if (config.env !== 'test') {
  //   router.use(loadMiddleware('logger'))
  // }

  router
    .use(cors())
    .use(
      bodyParser({
        enableTypes: ['json', 'text']
      })
    )
    .use(compression())

  router.use(containerMiddleware)
  router.use(loadMiddleware('error'))
  router.post('/pns/subscriber', loadMiddleware('register-device'))
  router.post('/pns/subscription', loadMiddleware('subscribe'))
  router.post('/pns/clearbadge', loadMiddleware('clear-badge'))
  router.post('/pns/publisher', loadMiddleware('register-publisher'))
  // router.post('/pns/notification', loadMiddleware('notify'))
  router.post('/logs/userlog', loadMiddleware('save-user-log'))

  koa.use(router.routes())
  koa.use(router.allowedMethods())
  koa.use(async (ctx, next) => {
    await next()
    if (!ctx.body) {
      ctx.body = {}
    }
  })

  return koa
}
