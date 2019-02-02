require('../../../../source-map-install')

import serverlessHttp from 'serverless-http'
import { createRouter } from '../router'
import { createContainer } from '../../../container'

const container = createContainer()
const router = createRouter(container)

// if (!config.production && !config.usingServerlessOffline) {
//   router.listen(config.port)
// }

export const handler = serverlessHttp(router)
