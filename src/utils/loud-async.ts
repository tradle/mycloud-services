import { AsyncFn } from '../types'

export const loudAsync = (asyncFn: AsyncFn) => async (...args) => {
  try {
    return await asyncFn(...args)
  } catch (err) {
    // tslint:disable-next-line: no-console
    console.error(err)
    throw err
  }
}
