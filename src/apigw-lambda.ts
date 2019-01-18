import { APIGatewayProxyHandler, APIGatewayEvent } from 'aws-lambda'
import { UserError, InvalidParameter } from './errors'

type ApiGWEventHandler<T> = (event:APIGatewayEvent) => Promise<T>
type ErrorBody = {
  message?: string
}

const parseBody = (body: string) => {
  try {
    return JSON.parse(body)
  } catch (err) {
    throw new InvalidParameter('expected JSON body')
  }
}

export const wrapHandler = <T>(handler:ApiGWEventHandler<T>):APIGatewayProxyHandler => async event => {
  let body: T|ErrorBody = null
  let statusCode = 200
  try {
    body = await handler(parseBody(event.body))
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
    body: JSON.stringify(body),
  }
}
