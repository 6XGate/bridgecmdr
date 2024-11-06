import { computed, nextTick, ref, shallowReadonly } from 'vue'
import { trackBusy } from '../hooks/tracking'
import type { DocumentId } from '../../preload/api'
import type { Ref } from 'vue'

export type { DocumentId } from '../../preload/api'

export function useDataStore<Document extends { _id: DocumentId }>() {
  const { isBusy, error, track, wait } = trackBusy()

  const items: Ref<Document[]> = ref([])

  const active = ref<Document>()

  function initialize(docs: Document[]) {
    items.value = [...docs]
    for (const doc of docs) {
      if (doc._id === active.value?._id) {
        active.value = doc
      }
    }
  }

  function defineOperation<Args extends unknown[]>(op: (...args: Args) => Promise<void>) {
    return async function storeOperation(...args: Args) {
      await wait(op(...args))
    }
  }

  function defineFetchMany<Args extends unknown[]>(op: (...args: Args) => Promise<Document[]>) {
    return async function storeCollect(...args: Args) {
      // Clear the list before load.
      initialize([])

      // Next tick give the UI a task cycle to catch up.
      await nextTick()
      const docs = await wait(op(...args))
      initialize(docs)
    }
  }

  function defineFetch<Args extends unknown[]>(op: (...args: Args) => Promise<Document>) {
    return async function storeFetch(...args: Args) {
      const fetchedItem = await wait(op(...args))
      replaceItem(fetchedItem)
      return fetchedItem
    }
  }

  function insertItem(doc: Document) {
    items.value.push(doc)
  }

  function defineInsertion<Args extends unknown[]>(op: (...args: Args) => Promise<Document>) {
    return async function storeInsert(...args: Args) {
      const newItem = await wait(op(...args))
      insertItem(newItem)
      return newItem
    }
  }

  function replaceItem(doc: Document) {
    const idx = items.value.findIndex((item) => item._id === doc._id)
    if (idx !== -1) {
      items.value.splice(idx, 1, doc)
    } else {
      items.value.push(doc)
    }

    if (doc._id === active.value?._id) {
      active.value = doc
    }
  }

  function defineMutation<Args extends unknown[]>(op: (...args: Args) => Promise<Document>) {
    return async function storeMutate(...args: Args) {
      const updatedItem = await wait(op(...args))
      replaceItem(updatedItem)
      return updatedItem
    }
  }

  function deleteItem(id: DocumentId) {
    const idx = items.value.findIndex((item) => item._id === id)
    if (idx !== -1) {
      items.value.splice(idx, 1)
    }

    if (id === active.value?._id) {
      active.value = undefined
    }
  }

  function defineRemoval<Args extends unknown[]>(op: (...args: Args) => Promise<DocumentId>) {
    return async function storeRemove(...args: Args) {
      deleteItem(await wait(op(...args)))
    }
  }

  function clearItems() {
    items.value = []
  }

  function unsetCurrent() {
    active.value = undefined
  }

  return {
    isBusy,
    error,
    items: computed(() => shallowReadonly(items.value)),
    // active,
    current: computed(() => active.value),
    track,
    wait,
    initialize,
    defineOperation,
    defineFetchMany,
    defineFetch,
    insertItem,
    defineInsertion,
    replaceItem,
    defineMutation,
    deleteItem,
    defineRemoval,
    clearItems,
    unsetCurrent
  }
}

export type DataSet<Document extends { _id: string }> = ReturnType<typeof useDataStore<Document>>
