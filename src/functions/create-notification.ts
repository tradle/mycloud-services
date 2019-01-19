import { wrapHandler } from '../apigw-lambda'
import { createHandler, CreateNotificationOpts } from '../actions/create-notification'
import { createContext } from '../create-context'

const rawHandler = createHandler(createContext())

export const handler = wrapHandler(({ body }) => rawHandler((body as unknown) as CreateNotificationOpts))
