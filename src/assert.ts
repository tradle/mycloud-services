import getPropAtPath from 'lodash/get'
import * as Errors from './errors'

type PrimitiveType = 'string' | 'number' | 'object' | 'boolean' | 'undefined' | 'function'

export interface AttrTypeMap {
  [attr: string]: PrimitiveType
}

export const requireOption = (obj: any, option: string, type: PrimitiveType) => {
  if (typeof obj[option] !== type) {
    throw new Errors.InvalidOption(`expected ${type} "${option}"`)
  }
}

export const requireOptions = (obj: any, typeMap: AttrTypeMap) => {
  // tslint:disable-next-line:prefer-const
  for (let opt in typeMap) {
    requireOption(obj, opt, typeMap[opt])
  }
}
