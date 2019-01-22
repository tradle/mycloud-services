import { Type } from 'io-ts'
import * as Errors from '../errors'

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

export const isTypeOf = (obj: any, typeDecoder: Type<any, any, any>) => {
  const result = typeDecoder.decode(obj)
  if (result.isRight()) return

  // const errMsg = result.value
  //   .map(({ context, value }) => {
  //     const path = context.slice(2).reduce((acc, prop) => (acc ? `${acc}.${prop.key}` : prop.key), '')
  //     const { type } = context[context.length - 1]
  //     return `expected ${path} to be a ${type.name}, got: ${value}`
  //   })
  //   .join('\n')

  const { context, value } = result.value.pop()
  const { key, type } = context.slice().pop()
  const errMsg = `expected ${key} to be a ${type.name}, got: ${value}`
  throw new Errors.InvalidOption(errMsg)
}
