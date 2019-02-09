import pino from 'pino'
import { Logger } from '../types'

export const createLogger = (opts: pino.LoggerOptions = {}) => {
  const logger: unknown = pino({
    useLevelLabels: true,
    customLevels: {
      // make @tradle/dynamodb happy
      silly: 0,
      log: 20 // same as info
    },
    ...opts
  })

  return logger as Logger
}
