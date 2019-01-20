import { KeyValueStore, LogStore } from './types'

export const createStore = (store: KeyValueStore): LogStore => ({ put: store.put })
