import { wrapHandler } from '../apigw-lambda'
import { create, CreateSubscriptionOpts } from '../actions/create-subscription'
import { createContext } from '../create-context'

const rawHandler = create(createContext())

export const handler = wrapHandler(({ body }) => rawHandler((body as unknown) as CreateSubscriptionOpts))
