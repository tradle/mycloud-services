import path from 'path'
import { config } from 'dotenv'

const PROJECT_ROOT = path.resolve(__dirname, '../../')
export const load = (env: any = process.env) => {
  const suffix = env.IS_OFFLINE || env.IS_LOCAL ? '.offline' : ''
  const envPath = path.resolve(PROJECT_ROOT, `.env${suffix}`)
  const { parsed } = config({ path: envPath })
  return {
    ...parsed,
    PROJECT_ROOT
  }
}
