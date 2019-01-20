import Koa from 'koa'
import Router from 'koa-router'
import cors from 'kcors'
import bodyParser from 'koa-body'
import compression from 'koa-compress'
import { Config, Middleware } from '../../types'
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
    .use(bodyParser())
    .use(compression())

  router.use(loadMiddleware('error'))
  router.use(containerMiddleware)
  router.post('/subscriber', loadMiddleware('subscriber'))
  router.post('/publisher', loadMiddleware('publisher'))
  router.post('/subscriber', loadMiddleware('subscriber'))
  router.post('/subscription', loadMiddleware('subscription'))
  router.post('/notification', loadMiddleware('notification'))
  router.post('/clearbadge', loadMiddleware('clear-badge'))

  koa.use(router.routes())
  koa.use(router.allowedMethods())
  return koa
}
