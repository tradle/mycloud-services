import * as Errors from '@tradle/errors'
import { DB, utils as dynamoUtils, Errors as DErrors } from '@tradle/dynamodb'
import CustomErrors from '../../errors'
import { ResourceMapper } from 'src/types'

interface UpdateOpts {
  db: DB
  resource: any
  versionProp: string
}

interface UpdateWithRetryOpts {
  db: DB
  current: any
  map: ResourceMapper
  maxAttempts: number
  versionProp: string
}

export const update = async ({ db, resource, versionProp }: UpdateOpts) => {
  const opts = dynamoUtils.createOptimisticLockingCondition({
    property: versionProp,
    value: resource[versionProp] - 1
  })

  opts.ReturnValues = 'NONE'

  try {
    await db.update(resource, opts)
  } catch (err) {
    Errors.ignore(err, { code: 'ConditionalCheckFailedException' })
    throw new CustomErrors.Conflict(resource)
  }
}

// item must already exist in the db
export const updateWithRetry = async ({ db, current, versionProp, map, maxAttempts }: UpdateWithRetryOpts) => {
  let attempts = maxAttempts
  let err
  let resource
  do {
    try {
      resource = map(current)
      await update({ db, resource, versionProp })
      err = null
    } catch (e) {
      err = e
      if (Errors.matches(err, CustomErrors.UpdateAborted)) return

      Errors.ignore(err, CustomErrors.Conflict)
      current = await db.get(current)
    }
  } while (err && err instanceof CustomErrors.Conflict && attempts--)
}

interface SetPropsOpts {
  db: DB
  map: ResourceMapper
  maxAttempts: number
  versionProp: string
  keys?: any
  current?: any
}

export const setProps = async (opts: SetPropsOpts) => {
  const { db, keys, versionProp, map, maxAttempts } = opts
  let { current } = opts
  try {
    current = current || (await db.get(keys))
  } catch (err) {
    Errors.ignore(err, DErrors.NotFound)
    current = keys
    try {
      await db.put(map(current), { overwrite: false })
      return
    } catch (err) {
      Errors.ignore(err, { name: 'ConditionalCheckFailedException' })
      // someone snuck in ahead of us!
      // go back to updating
      return setProps(opts)
    }
  }

  await updateWithRetry({ db, current, versionProp, map, maxAttempts })
}
