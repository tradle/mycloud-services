
import { wrapHandler } from '../apigw-lambda'
import { createNotification } from '../create-notification'

export const handler = wrapHandler(createNotification)
