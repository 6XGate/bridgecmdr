import { randomUUID } from 'node:crypto'
import PouchDb from 'pouchdb-core'
import find from 'pouchdb-find'
import { map, memo } from 'radash'
import { z } from 'zod'
import { useLevelAdapter } from './level'
import type { IterableElement, Simplify } from 'type-fest'
import { Attachment } from '@/attachments'
import { isNotNullish } from '@/basics'

type IndexFields = string[]
type IndexList = IndexFields[]
type NamedIndices = Record<string, IndexFields>

export type Indices = IndexList | NamedIndices

export type DocumentId = z.output<typeof DocumentId>
export const DocumentId = z
  .string()
  .uuid()
  .transform((value) => value.toUpperCase())
export type RevisionId = z.output<typeof RevisionId>
export const RevisionId = z.string().min(1)

export type BaseDocument<Schema extends z.AnyZodObject> = Simplify<PouchDB.Core.ExistingDocument<z.infer<Schema>>>
export type Database<Schema extends z.AnyZodObject> = ReturnType<typeof defineDatabaseCore<Schema>>
export type DocumentOf<Schema extends z.AnyZodObject> = Simplify<
  IterableElement<Awaited<ReturnType<Database<Schema>['all']>>>
>

function isFullAttachment(value: PouchDB.Core.Attachment): value is PouchDB.Core.FullAttachment {
  return 'data' in value
}

async function translateAttachment(key: string, attachment: PouchDB.Core.FullAttachment) {
  return await Attachment.fromPouchAttachment(key, attachment)
}

async function prepareAttachment(key: string, attachment: PouchDB.Core.Attachment) {
  return isFullAttachment(attachment)
    ? /* v8 ignore next 2 */ // `false` is actually unlikely due to design.
      await translateAttachment(key, attachment)
    : null
}

async function prepareAttachments(attachments: PouchDB.Core.Attachment[] | null | undefined) {
  if (attachments == null) return []
  return (
    await map(Object.entries(attachments), async ([key, attachment]) => await prepareAttachment(key, attachment))
  ).filter(isNotNullish)
}

export async function prepareDocument<T extends Record<string, unknown>>(doc: T) {
  const { _attachments, _conflicts, _revs_info, _revisions, ...document } = doc
  const result = { ...document, _attachments: await prepareAttachments(_attachments as never) }
  return result as Simplify<typeof result>
}

PouchDb.plugin(useLevelAdapter())
PouchDb.plugin(find)

export type getDocument<Schema extends z.AnyZodObject> = Simplify<z.infer<ReturnType<typeof getDocument<Schema>>>>
export function getDocument<Schema extends z.AnyZodObject>(schema: Schema) {
  return schema.and(
    z.object({
      _id: DocumentId,
      _rev: RevisionId,
      _attachments: z.array(z.instanceof(Attachment))
    })
  )
}

export type getInsertable<Schema extends z.AnyZodObject> = Simplify<z.infer<ReturnType<typeof getInsertable<Schema>>>>
export function getInsertable<Schema extends z.AnyZodObject>(schema: Schema) {
  return schema
}

export type getUpdateable<Schema extends z.AnyZodObject> = Simplify<z.infer<ReturnType<typeof getUpdateable<Schema>>>>
export function getUpdateable<Schema extends z.AnyZodObject>(schema: Schema) {
  type Shape = Schema['shape']
  // HACK: Partial looses the shape in this generic context.
  const partial = schema.partial() as z.ZodObject<{ [K in keyof Shape]: z.ZodOptional<Shape[K]> }, 'strip'>
  return partial.and(z.object({ _id: DocumentId }))
}

function defineDatabaseCore<RawSchema extends z.AnyZodObject>(
  name: string,
  rawSchema: RawSchema,
  ...indicesBlocks: Indices[]
) {
  type RawDocument = z.output<RawSchema>
  type PouchDatabase = InstanceType<typeof PouchDB<RawDocument>>
  type Insertable = getInsertable<typeof rawSchema>
  type Updateable = getUpdateable<typeof rawSchema>

  const Insertable = getInsertable(rawSchema)

  const booted = (async function booted() {
    const db = new PouchDb<RawDocument>(name)
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

    for (const fields of basicIndices) {
      // eslint-disable-next-line no-await-in-loop -- Should be serialized.
      await db.createIndex({ index: { fields } })
    }

    for (const [index, fields] of namedIndices) {
      // eslint-disable-next-line no-await-in-loop -- Should be serialized.
      await db.createIndex({ index: { fields, name: index } })
    }

    return db
  })()

  /**
   * Defines a database operations.
   */
  const defineOperation =
    <Args extends unknown[], Result>(op: (current: PouchDatabase, ...args: Args) => Promise<Result>) =>
    async (...args: Args) =>
      await op(await booted, ...args)

  /**
   * Gets all documents, in raw form, from the database.
   */
  const allDocs = defineOperation(async function allDocs(db) {
    const response = await db.allDocs({
      include_docs: true,
      attachments: true,
      binary: true,
      // Since we use GUIDs, the first character will be between these values.
      startkey: '0',
      endkey: 'Z'
    })

    return response.rows.map((row) => row.doc).filter(isNotNullish)
  })

  /**
   * Gets the specified document, in raw form, from the database.
   */
  const getDoc = defineOperation(async function getDoc(db, id: DocumentId) {
    return await db.get<RawDocument>(id.toUpperCase(), { attachments: true, binary: true })
  })

  /**
   * Compacts the database.
   */
  const compact = defineOperation(async function compact(db) {
    await db.compact()
  })

  /**
   * Provides a means to tap into the database interface directly.
   */
  const query = async <Result>(callback: (current: PouchDatabase) => Promise<Result>) => await callback(await booted)

  /**
   * Gets all document from the database.
   */
  async function all() {
    return await map(await allDocs(), prepareDocument)
  }

  /**
   * Gets the specified document from the database.
   */
  async function get(id: DocumentId) {
    return await getDoc(id).then(prepareDocument)
  }

  /**
   * Adds attachments to a document.
   */
  const addAttachments = defineOperation(async function addAttachments(db, id: DocumentId, attachments: Attachment[]) {
    // Add each attachment one-at-a-time, this must be serial.
    for (const attachment of attachments) {
      // eslint-disable-next-line no-await-in-loop -- Must be serialized.
      const doc = await getDoc(id)
      // eslint-disable-next-line no-await-in-loop -- Must be serialized.
      await db.putAttachment(id, attachment.name, doc._rev, Buffer.from(attachment), attachment.type)
    }
  })

  /**
   * Adds a document to the database.
   */
  const add = defineOperation(async function add(db, document: Insertable, ...attachments: Attachment[]) {
    const doc = { ...Insertable.parse(document), _id: randomUUID().toUpperCase() }
    await db.put(doc)
    if (attachments.length > 0) {
      await addAttachments(doc._id, attachments)
    }

    return await get(doc._id)
  })

  /**
   * Updates an existing document in the database.
   */
  const update = defineOperation(async function update(db, document: Updateable, ...attachments: Attachment[]) {
    const id = document._id
    const old = await db.get(id)
    const doc = { ...Insertable.parse({ ...old, ...document }), _id: id, _rev: old._rev }

    await db.put(doc)
    if (attachments.length > 0) {
      await addAttachments(id, attachments)
    }

    return await get(id)
  })

  /**
   * Removes a document from the database.
   */
  const remove = defineOperation(async function remove(db, id: DocumentId) {
    const doc = await getDoc(id)
    await db.remove(doc)
  })

  /**
   * Removes all documents from the database.
   */
  const clear = defineOperation(async function clear(db) {
    const docs = await allDocs()
    await map(docs, async (doc) => await db.remove(doc))
    await db.compact()
  })

  return {
    $name: name,
    $schemas: rawSchema,
    prepare: prepareDocument<BaseDocument<RawSchema>>,
    defineOperation,
    compact,
    query,
    all,
    get,
    add,
    update,
    remove,
    clear
  }
}

type DatabaseCore<Schema extends z.AnyZodObject> = ReturnType<typeof defineDatabaseCore<Schema>>

interface DefineDatabaseOptions<Schema extends z.AnyZodObject, Interface extends Record<string, unknown>> {
  name: string
  schema: Schema
  indices?: Indices[]
  setup: (base: DatabaseCore<Schema>) => Interface
}

export const defineDatabase = <Schema extends z.AnyZodObject, Interface extends Record<string, unknown>>(
  options: DefineDatabaseOptions<Schema, Interface>
) =>
  memo(function $defineDatabase() {
    const { name, schema, indices = [], setup } = options

    const base = defineDatabaseCore(name, schema, ...indices)
    const augment = setup(base)

    return {
      ...base,
      ...augment
    }
  })
