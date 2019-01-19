import { wrapHandler } from '../apigw-lambda'
import { create as createSubscriber } from '../domain/subscriber'
import { create as createContext } from '../context'

const subscriber = createSubscriber(createContext())

export const handler = wrapHandler(({ body }) => subscriber.clearBadge(body as any))
