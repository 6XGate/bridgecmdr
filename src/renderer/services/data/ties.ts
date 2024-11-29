import { defineStore } from 'pinia'
import { forceUndefined } from '../../hooks/utilities'
import { useClient } from '../rpc/trpc'
import { useDataStore } from '../store'
import type { NewTie, TieUpdate, Tie, TieUpsert } from '../../../preload/api'
import type { DocumentId } from '../store'

export type { NewTie, TieUpdate, Tie } from '../../../preload/api'

export const useTies = defineStore('ties', function defineTies() {
  const { ties } = useClient()
  const store = useDataStore<Tie>()

  function blank(): NewTie {
    return {
      sourceId: forceUndefined(),
      deviceId: forceUndefined(),
      inputChannel: forceUndefined(),
      outputChannels: {
        video: undefined,
        audio: undefined
      }
    }
  }

  const compact = store.defineOperation(async () => {
    await ties.compact.mutate()
  })

  const all = store.defineFetchMany(async () => await ties.all.query())

  const get = store.defineFetch(async (id: DocumentId) => await ties.get.query(id))

  const add = store.defineInsertion(async (document: NewTie) => await ties.add.mutate(document))

  const update = store.defineMutation(async (document: TieUpdate) => await ties.update.mutate(document))

  const upsert = store.defineMutation(async (document: TieUpsert) => await ties.upsert.mutate(document))

  const remove = store.defineRemoval(async (id: DocumentId) => {
    await ties.remove.mutate(id)
    return id
  })

  const forDevice = store.defineFetchMany(async (id: DocumentId) => await ties.forDevice.query(id))

  const forSource = store.defineFetchMany(async (id: DocumentId) => await ties.forSource.query(id))

  return {
    isBusy: store.isBusy,
    error: store.error,
    items: store.items,
    current: store.current,
    blank,
    compact,
    all,
    get,
    add,
    update,
    upsert,
    remove,
    forDevice,
    forSource,
    dismiss: store.unsetCurrent,
    clear: store.clearItems
  }
})
