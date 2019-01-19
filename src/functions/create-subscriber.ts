import { wrapHandler } from '../apigw-lambda'
import { createHandler, CreateSubscriberOpts } from '../actions/create-subscriber'
import { createContext } from '../create-context'

const rawHandler = createHandler(createContext())

export const handler = wrapHandler(({ body }) => rawHandler((body as unknown) as CreateSubscriberOpts))
