import { wrapHandler } from '../apigw-lambda'
import { create as createPublisher, NotifyOpts } from '../domain/publisher'
import { create as createContext } from '../context'

const publisher = createPublisher(createContext())

export const handler = wrapHandler(({ body }) => publisher.notify((body as unknown) as NotifyOpts))
