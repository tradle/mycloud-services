import pino from "pino"
import { ILogger } from "@tradle/dynamodb"

export const createLogger = (opts: pino.LoggerOptions) => {
  const logger: unknown = pino({
    useLevelLabels: true,
    customLevels: {
      silly: 0,
      log: 20 // same as info
    },
    ...opts
  })

  return logger as ILogger
}
