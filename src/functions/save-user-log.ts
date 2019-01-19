import { wrapHandler } from '../apigw-lambda'
import { create, SaveUserLogOpts } from '../actions/save-user-log'
import { createContext } from '../create-context'

const rawHandler = create(createContext())

export const handler = wrapHandler(({ body, query }) =>
  rawHandler({
    firstName: query.firstName,
    lastName: query.lastName,
    log: body
  })
)
