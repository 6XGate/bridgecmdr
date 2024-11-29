import { defineStore } from 'pinia'
import { forceUndefined } from '../../hooks/utilities'
import { useClient } from '../rpc/trpc'
import { useDataStore } from '../store'
import type { NewSource, Source, SourceUpdate, SourceUpsert } from '../../../preload/api'
import type { DocumentId } from '../store'
import type { Attachment } from '@/attachments'

export type { NewSource, Source, SourceUpdate } from '../../../preload/api'

export const useSources = defineStore('sources', function defineSources() {
  const { sources } = useClient()
  const store = useDataStore<Source>()

  function blank(): NewSource {
    return {
      order: -1,
      title: forceUndefined(),
      image: null
    }
  }

  const compact = store.defineOperation(async () => {
    await sources.compact.mutate()
  })

  const all = store.defineFetchMany(async () => await sources.all.query())

  const get = store.defineFetch(async (id: DocumentId) => await sources.get.query(id))

  const add = store.defineInsertion(async (document: NewSource, ...attachments: Attachment[]) => {
    if (document.order === -1) {
      document.order = await getNextOrderValue()
    }

    return await sources.add.mutate([document, ...attachments])
  })

  const update = store.defineMutation(async (document: SourceUpdate, ...attachments: Attachment[]) => {
    if (document.order === -1) {
      document.order = await getNextOrderValue()
    }

    return await sources.update.mutate([document, ...attachments])
  })

  const upsert = store.defineMutation(async (document: SourceUpsert, ...attachments: Attachment[]) => {
    if (document.order === -1) {
      document.order = await getNextOrderValue()
    }

    return await sources.upsert.mutate([document, ...attachments])
  })

  const remove = store.defineRemoval(async (id: DocumentId) => {
    await sources.remove.mutate(id)
    return id
  })

  async function getNextOrderValue() {
    return await sources.getNextOrderValue.query()
  }

  async function normalizeOrder() {
    await sources.normalizeOrder.mutate()
  }

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
    dismiss: store.unsetCurrent,
    clear: store.clearItems,
    // Utilities
    getNextOrderValue,
    normalizeOrder
  }
})
