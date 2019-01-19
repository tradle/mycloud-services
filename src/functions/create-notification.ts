import { wrapHandler } from '../apigw-lambda'
import { create, CreateNotificationOpts } from '../actions/create-notification'
import { createContext } from '../create-context'

const rawHandler = create(createContext())

export const handler = wrapHandler(({ body }) => rawHandler((body as unknown) as CreateNotificationOpts))
