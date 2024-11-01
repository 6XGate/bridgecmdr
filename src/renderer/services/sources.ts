import { defineStore } from 'pinia'
import { forceUndefined } from '../helpers/utilities'
import { useClient } from './rpc'
import { useDataStore } from './store'
import type { DocumentId } from './store'
import type { NewSource, Source, SourceUpdate } from '../../preload/api'
import type { Attachment } from '@/attachments'

export type { NewSource, Source, SourceUpdate } from '../../preload/api'

export const useSources = defineStore('sources', function defineSources() {
  const { sources } = useClient()
  const store = useDataStore<Source>()

  function blank(): NewSource {
    return {
      title: forceUndefined(),
      image: null
    }
  }

  const compact = store.defineOperation(async () => {
    await sources.compact.mutate()
  })

  const all = store.defineFetchMany(async () => await sources.all.query())

  const get = store.defineFetch(async (id: DocumentId) => await sources.get.query(id))

  const add = store.defineInsertion(
    async (document: NewSource, ...attachments: Attachment[]) => await sources.add.mutate([document, ...attachments])
  )

  const update = store.defineMutation(
    async (document: SourceUpdate, ...attachments: Attachment[]) =>
      await sources.update.mutate([document, ...attachments])
  )

  const remove = store.defineRemoval(async (id: DocumentId) => {
    await sources.remove.mutate(id)
    return id
  })

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
    remove,
    dismiss: store.unsetCurrent,
    clear: store.clearItems
  }
})
