import { APIGatewayProxyHandler, APIGatewayEvent as RawAPIGatewayEvent } from 'aws-lambda'
import { UserError, InvalidParameter } from './errors'
import { ParsedAPIGatewayEvent } from './types'
import { parseEvent } from './parse-event'

type ApiGWEventHandler<T> = (event: ParsedAPIGatewayEvent) => Promise<T>
type ErrorBody = {
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
      statusCode = 500
      body = { message: 'something went wrong' }
    }
  }

  return {
    statusCode,
    body: JSON.stringify(body)
  }
}
