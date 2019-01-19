import { wrapHandler } from '../apigw-lambda'
import { createHandler, ClearBadgeOpts } from '../actions/clear-badge'
import { createContext } from '../create-context'

const rawHandler = createHandler(createContext())

export const handler = wrapHandler(({ body }) => rawHandler((body as unknown) as ClearBadgeOpts))
