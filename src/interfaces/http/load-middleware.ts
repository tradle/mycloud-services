import path from 'path'
import { Middleware } from '../../types'

export const loadMiddleware = (relativePath: string) => {
  const controllerPath = path.resolve(__dirname, 'middleware', relativePath)
  return require(controllerPath).create() as Middleware
}
