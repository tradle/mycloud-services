import path from 'path'
import { config } from 'dotenv'

const PROJECT_ROOT = path.resolve(__dirname, '../../')

export const isLocal = env => env.IS_OFFLINE || env.IS_LOCAL

export const load = (env: any = process.env) => {
  const IS_LOCAL = isLocal(env)
  const suffix = isLocal(env) ? '.offline' : ''
  const envPath = path.resolve(PROJECT_ROOT, `.env${suffix}`)
  const { parsed } = config({ path: envPath })
  return {
    ...parsed,
    IS_LOCAL,
    PROJECT_ROOT
  }
}
