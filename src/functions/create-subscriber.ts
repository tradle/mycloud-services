import { wrapHandler } from '../apigw-lambda'
import { create, CreateSubscriberOpts } from '../actions/create-subscriber'
import { createContext } from '../create-context'

const rawHandler = create(createContext())

export const handler = wrapHandler(({ body }) => rawHandler((body as unknown) as CreateSubscriberOpts))
