import { APIGatewayProxyHandler, APIGatewayEvent as RawAPIGatewayEvent } from 'aws-lambda'

export const parseHeaders = (headers: any) =>
  Object.keys(headers).reduce((normalized, name) => {
    normalized[name.toLowerCase()] = headers[name]
    return normalized
  }, {})

export const parseBody = (event: RawAPIGatewayEvent) => {
  let body = event.body
  if (event.isBase64Encoded) {
    body = new Buffer(body, 'base64').toString('utf8')
  }

  try {
    return JSON.parse(body)
  } catch (err) {
    return body
  }
}

export const parseEvent = (event: RawAPIGatewayEvent) => ({
  headers: parseHeaders(event),
  body: parseBody(event),
  query: event.queryStringParameters
})
