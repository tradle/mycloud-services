import { KeyValueStore, LogStore } from './types'

export const createStore = (store: KeyValueStore): LogStore => {
  return {
    putUserLog: store.put
  }
}
