import { wrapHandler } from '../apigw-lambda'
import { create as createUserLogs } from '../domain/user-logs'
import { create as createContext } from '../context'

const userLogs = createUserLogs({
  store: createContext().logStore
})

export const handler = wrapHandler(({ body, query }) =>
  userLogs.put({
    firstName: query.firstName,
    lastName: query.lastName,
    log: body
  })
)
