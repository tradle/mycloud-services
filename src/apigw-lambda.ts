import { APIGatewayProxyHandler, APIGatewayEvent as RawAPIGatewayEvent } from 'aws-lambda'
import { UserError, InvalidOption } from './errors'
import { ParsedAPIGatewayEvent } from './types'
import { parseEvent } from './parse-event'
import { createLogger } from './logger'

const logger = createLogger({
  level: 'debug'
})

type ApiGWEventHandler<T> = (event: ParsedAPIGatewayEvent) => Promise<T>
interface ErrorBody {
  message?: string
}

export const wrapHandler = <T>(handler: ApiGWEventHandler<T>): APIGatewayProxyHandler => async event => {
  let body: T | ErrorBody = null
  let statusCode = 200
  try {
    const parsedEvent: ParsedAPIGatewayEvent = parseEvent(event)
    body = await handler(parsedEvent)
  } catch (err) {
    if (err instanceof UserError) {
      statusCode = 400
      body = { message: err.message }
    } else {
      logger.error(err)
      statusCode = 500
      body = { message: 'something went wrong' }
    }
  }

  return {
    statusCode,
    body: JSON.stringify(body)
  }
}
