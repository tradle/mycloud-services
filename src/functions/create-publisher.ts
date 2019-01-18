
import { wrapHandler } from '../apigw-lambda'
import { createPublisher } from '../create-publisher'

export const handler = wrapHandler(createPublisher(ctx))
