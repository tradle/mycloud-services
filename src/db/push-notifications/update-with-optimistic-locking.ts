import * as Errors from '@tradle/errors'
import { DB, utils as dynamoUtils } from '@tradle/dynamodb'
import CustomErrors from '../../errors'

interface UpdateOpts { 
  db: DB 
  resource: any 
}

export default async ({ db, resource }: UpdateOpts) => {
  const opts = dynamoUtils.createOptimisticLockingCondition({ property: '_v', value: resource._v - 1 })
  try {
    await db.update(resource, opts)
  } catch (err) {
    Errors.ignore(err, { code: 'ConditionalCheckFailedException' })
    throw new CustomErrors.Conflict('please read and try again')
  }
}