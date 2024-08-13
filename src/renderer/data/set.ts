import { computed, readonly, ref } from 'vue'
import type { DocumentId, DocumentOf } from './database'
import type { Ref } from 'vue'
import type { z } from 'zod'

export const useDataSet = <Schema extends z.AnyZodObject>(_: Schema) => {
  type Document = DocumentOf<Schema>

  const items: Ref<Document[]> = ref([])

  const current = ref<Document>()

  const initialize = (docs: Document[]) => {
    items.value = [...docs]
    docs.forEach(doc => {
      if (doc._id === current.value?._id) {
        current.value = doc
      }
    })
  }

  const insertItem = (doc: Document) => {
    items.value.push(doc)
  }

  const replaceItem = (doc: Document) => {
    const idx = items.value.findIndex(item => item._id === doc._id)
    if (idx !== -1) {
      items.value.splice(idx, 1, doc)
    } else {
      items.value.push(doc)
    }

    if (doc._id === current.value?._id) {
      current.value = doc
    }
  }

  const deleteItem = (id: DocumentId) => {
    const idx = items.value.findIndex(item => item._id === id)
    if (idx !== -1) {
      items.value.splice(idx, 1)
    }

    if (id === current.value?._id) {
      current.value = undefined
    }
  }

  const clearItems = () => {
    items.value = []
  }

  return {
    items: computed(() => readonly(items.value)),
    current,
    initialize,
    insertItem,
    replaceItem,
    deleteItem,
    clearItems
  }
}

export type DataSet<Schema extends z.AnyZodObject> = ReturnType<typeof useDataSet<Schema>>
