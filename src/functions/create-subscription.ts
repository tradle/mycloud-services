import { wrapHandler } from '../apigw-lambda'
import { createHandler, CreateSubscriptionOpts } from '../actions/create-subscription'
import { createContext } from '../create-context'

const rawHandler = createHandler(createContext())

export const handler = wrapHandler(({ body }) => rawHandler((body as unknown) as CreateSubscriptionOpts))
