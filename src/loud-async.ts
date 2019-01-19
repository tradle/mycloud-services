import { AsyncFn } from '@localtypes'

export const loudAsync = (asyncFn: AsyncFn) => async (...args) => {
  try {
    return await asyncFn(...args)
  } catch (err) {
    console.error(err)
    throw err
  }
}
