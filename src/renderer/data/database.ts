import { createSharedComposable } from '@vueuse/core'
import PouchDb from 'pouchdb-core'
import find from 'pouchdb-find'
import { v4 as uuid } from 'uuid'
import { computed } from 'vue'
import { z } from 'zod'
import { useLevelAdapter } from './level'
import type { IterableElement } from 'type-fest'
import type { DeepReadonly } from 'vue'
import { isNotNullish } from '@/basics'

type IndexFields = string[]
type IndexList = IndexFields[]
type NamedIndices = Record<string, IndexFields>

export type Attachments = PouchDB.Core.Attachments
export type Attachment = PouchDB.Core.Attachment
export type Indices = IndexList | NamedIndices
export type ExistingDocument<T> = PouchDB.Core.ExistingDocument<T & PouchDB.Core.AllDocsMeta>
export type GetDocument<T extends Record<string, unknown>> = PouchDB.Core.Document<T> & PouchDB.Core.GetMeta
export type Document<T extends Record<string, unknown>> = PouchDB.Core.Document<T>

export type PutDocument<T extends Record<string, unknown>> = PouchDB.Core.PutDocument<T>

export type DocumentId = z.output<typeof DocumentId>
export const DocumentId = z
  .string()
  .uuid()
  .transform((value) => value.toUpperCase())

export type Database<Schema extends z.AnyZodObject> = ReturnType<ReturnType<typeof defineDatabase<Schema>>>
export type DocumentOf<Schema extends z.AnyZodObject> = IterableElement<Awaited<ReturnType<Database<Schema>['all']>>>

export type NewOf<Schema extends z.AnyZodObject> = PutDocument<Parameters<Database<Schema>['add']>[0]>

PouchDb.plugin(useLevelAdapter())
PouchDb.plugin(find)

export const defineDatabase = <Schema extends z.AnyZodObject>(
  name: string,
  rawSchema: Schema,
  ...indicesBlocks: Indices[]
) =>
  createSharedComposable(() => {
    type Doc = z.output<Schema>
    type Raw = z.input<Schema>
    type PouchDatabase = InstanceType<typeof PouchDB<Doc>>

    const schema = rawSchema.and(
      z.object({
        _id: DocumentId.default(() => uuid().toUpperCase()),
        _rev: z.string().min(1).optional()
      })
    )

    const booted = (async () => {
      const db = new PouchDb<Doc>(name)
      const namedIndices = new Map<string, IndexFields>()
      const basicIndices: IndexFields[] = []

      // Record the indices

      for (const indices of indicesBlocks) {
        if (Array.isArray(indices)) {
          basicIndices.push(...indices)
        } else {
          for (const [key, value] of Object.entries(indices)) {
            namedIndices.set(key, value)
          }
        }
      }

      for await (const fields of basicIndices) {
        await db.createIndex({ index: { fields } })
      }

      for await (const [index, fields] of namedIndices) {
        await db.createIndex({ index: { fields, name: index } })
      }

      return db
    })()

    /**
     * Compacts the database.
     */
    const compact = async () => {
      const db = await booted

      await db.compact()
    }

    /**
     * Provides a means to tap into the database interface directly.
     */
    const query = async <Result>(callback: (current: PouchDatabase) => Promise<Result>) => await callback(await booted)

    /**
     * Gets all document from the database.
     */
    const all = async () => {
      const db = await booted
      const response = await db.allDocs({
        include_docs: true,
        attachments: true,
        binary: true,
        // Since we use GUIDs, the first character will be between these values.
        startkey: '0',
        endkey: 'Z'
      })

      return response.rows.map((row) => row.doc).filter(isNotNullish)
    }

    /**
     * Gets the specified document from the database.
     */
    const get = async (id: DocumentId, attachments = true) => {
      const db = await booted

      return await db.get<Doc>(id.toUpperCase(), attachments ? { attachments: true, binary: true } : {})
    }

    /**
     * Adds attachments to a document.
     */
    const addAttachments = async (id: DocumentId, attachments: File[]) => {
      const db = await booted

      // Add each attachment one-at-a-time, this must be serial.
      for (const attachment of attachments) {
        // eslint-disable-next-line no-await-in-loop -- Must be serialized.
        const doc = await get(id, false)
        // eslint-disable-next-line no-await-in-loop -- Must be serialized.
        await db.putAttachment(id, attachment.name, doc._rev, attachment, attachment.type)
      }
    }

    /**
     * Adds a document to the database.
     */
    const add = async (doc: Raw, ...attachments: File[]) => {
      const db = await booted

      const document = schema.parse(doc)

      await db.put(document)
      if (attachments.length > 0) {
        await addAttachments(document._id, attachments)
      }

      return await get(document._id)
    }

    /**
     * Updates an existing document in the database.
     */
    const update = async (doc: DeepReadonly<GetDocument<Doc>>, ...attachments: File[]) => {
      const db = await booted
      const id = doc._id

      const document = schema.parse(doc)

      const old = await db.get(document._id)
      document._rev = old._rev

      await db.put(document)
      if (attachments.length > 0) {
        await addAttachments(id, attachments)
      }

      return await get(id)
    }

    /**
     * Removes a document from the database.
     */
    const remove = async (id: string) => {
      const db = await booted
      const doc = await get(id, false)
      await db.remove(doc)
    }

    return {
      name$: computed(() => name),
      compact,
      query,
      all,
      get,
      add,
      update,
      remove
    }
  })
