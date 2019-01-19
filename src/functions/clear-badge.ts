import { wrapHandler } from '../apigw-lambda'
import { create, ClearBadgeOpts } from '../actions/clear-badge'
import { createContext } from '../create-context'

const rawHandler = create(createContext())

export const handler = wrapHandler(({ body }) => rawHandler((body as unknown) as ClearBadgeOpts))
