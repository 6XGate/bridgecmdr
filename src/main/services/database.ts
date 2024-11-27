import { randomUUID } from 'node:crypto'
import PouchDb from 'pouchdb-core'
import find from 'pouchdb-find'
import mapReduce from 'pouchdb-mapreduce'
import { map } from 'radash'
import { z } from 'zod'
import { useLevelAdapter } from './level'
import type { Simplify } from 'type-fest'
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

async function prepareAttachments(attachments: Record<string, PouchDB.Core.Attachment> | null | undefined) {
  if (attachments == null) return []
  return (
    await Promise.all(
      Object.entries(attachments).map(async ([key, attachment]) => await prepareAttachment(key, attachment))
    )
  ).filter(isNotNullish)
}

export type inferDocumentOf<Schema> = Schema extends z.AnyZodObject
  ? Simplify<z.infer<ReturnType<typeof inferDocumentOf<Schema>>>>
  : never
export function inferDocumentOf<Schema extends z.AnyZodObject>(schema: Schema) {
  return schema.and(
    z.object({
      _id: DocumentId,
      _rev: RevisionId,
      _attachments: z.array(z.instanceof(Attachment))
    })
  )
}

export type inferNewDocumentOf<Schema> = Schema extends z.AnyZodObject
  ? Simplify<z.infer<ReturnType<typeof inferNewDocumentOf<Schema>>>>
  : never
export function inferNewDocumentOf<Schema extends z.AnyZodObject>(schema: Schema) {
  return schema
}

export type inferUpdatesOf<Schema> = Schema extends z.AnyZodObject
  ? Simplify<z.infer<ReturnType<typeof inferUpdatesOf<Schema>>>>
  : never
export function inferUpdatesOf<Schema extends z.AnyZodObject>(schema: Schema) {
  type Shape = Schema['shape']
  // HACK: Partial looses the shape in this generic context.
  const partial = schema.partial() as z.ZodObject<{ [K in keyof Shape]: z.ZodOptional<Shape[K]> }, 'strip'>
  return partial.and(
    z.object({
      _id: DocumentId,
      _attachments: z.array(z.instanceof(Attachment)).optional()
    })
  )
}

export type inferUpsertOf<Schema> = Schema extends z.AnyZodObject
  ? Simplify<z.infer<ReturnType<typeof inferUpsertOf<Schema>>>>
  : never
export function inferUpsertOf<Schema extends z.AnyZodObject>(schema: Schema) {
  return schema.and(
    z.object({
      _id: DocumentId,
      _attachments: z.array(z.instanceof(Attachment)).optional()
    })
  )
}

PouchDb.plugin(useLevelAdapter())
PouchDb.plugin(find)
PouchDb.plugin(mapReduce)

/** The basis of a database. */
export class Database<RawSchema extends z.AnyZodObject> {
  /** The Zod schema for the raw document data, same as the new document payload. */
  readonly #schema
  /** A promise that tracks if the database has booted. */
  readonly #booted

  /** The raw document data, same as the new document payload. */
  declare readonly __raw__: z.infer<RawSchema>
  /** The database document that is retrieved from the database. */
  declare readonly __document__: inferDocumentOf<RawSchema>
  /** The possible document updates. */
  declare readonly __updates__: inferUpdatesOf<RawSchema>
  /** The raw document is a predefined ID. */
  declare readonly __upsert__: inferUpsertOf<RawSchema>

  /**
   * Initializes a new instance of the Database class.
   * @param name - The name of the database.
   * @param schema - The raw document schema.
   * @param indicesBlocks - The index definition blocks.
   */
  constructor(name: string, schema: RawSchema, ...indicesBlocks: Indices[]) {
    this.#schema = schema
    this.#booted = this.boot(name, indicesBlocks)
  }

  /**
   * Defines the basis database of a specific schema.
   * @param name - The name of the database.
   * @param schema - The raw document schema.
   * @param indicesBlocks - The index definition blocks.
   * @returns A class that defines the database for the name and schema.
   */
  static of<RawSchema extends z.AnyZodObject>(name: string, schema: RawSchema, ...indicesBlocks: Indices[]) {
    return class extends Database<RawSchema> {
      constructor() {
        super(name, schema, ...indicesBlocks)
      }
    }
  }

  /** Boots the database with the given name and indices. */
  private async boot(name: string, indicesBlocks: Indices[]) {
    const db = new PouchDb<typeof this.__raw__>(name)
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
  }

  /** Run an operation with a booted database. */
  protected async run<Result>(op: (db: PouchDB.Database<typeof this.__raw__>) => Promise<Result>) {
    return await this.#booted.then(op)
  }

  /** Gets all documents, in raw form, from the database. */
  protected async allDocs() {
    return await this.run(async (db) => {
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
  }

  /** Gets the specified document, in raw form, from the database. */
  protected async getDoc(id: DocumentId) {
    return await this.run(async (db) => await db.get(id.toUpperCase(), { attachments: true, binary: true }))
  }

  /** Adds attachments to a document. */
  protected async addAttachments(id: DocumentId, rev: RevisionId, attachments: Attachment[]) {
    await this.run(async (db) => {
      let revId = rev
      for (const attachment of attachments) {
        // eslint-disable-next-line no-await-in-loop -- Must be serialized.
        const response = await db.putAttachment(id, attachment.name, revId, Buffer.from(attachment), attachment.type)
        /* v8 ignore next 1 */ // Likely trigger by database corruption.
        if (!response.ok) throw new Error(`Failed to add attachment "${attachment.name}"`)
        revId = response.rev
      }
    })
  }

  /** Prepares the document. */
  protected async prepare<T extends typeof this.__raw__>(doc: T) {
    const { _attachments, _conflicts, _revs_info, _revisions, ...document } = doc
    const result = { ...document, _attachments: await prepareAttachments(_attachments as never) }
    return result as Simplify<typeof result>
  }

  /** Compacts the database. */
  async compact() {
    await this.run(async (db) => {
      await db.compact()
    })
  }

  /** Gets all document from the database */
  async all() {
    return await this.run(async () => await map(await this.allDocs(), async (d) => await this.prepare(d)))
  }

  /** Gets the specified document from the database. */
  async get(id: DocumentId) {
    return await this.getDoc(id).then(async (d) => await this.prepare(d))
  }

  /** Adds a document to the database. */
  async add(document: Simplify<typeof this.__raw__>, ...attachments: Attachment[]) {
    return await this.run(async (db) => {
      const doc = { ...this.#schema.parse(document), _id: randomUUID().toUpperCase() }
      const result = await db.put(doc)
      /* v8 ignore next 1 */ // Likely trigger by database corruption.
      if (!result.ok) throw new Error(`Failed to insert document "${doc._id}"`)
      if (attachments.length > 0) {
        await this.addAttachments(result.id, result.rev, attachments)
      }

      return await this.get(result.id)
    })
  }

  /** Updates an existing document, or inserts a new one, with the given ID. */
  async upsert(document: Simplify<typeof this.__upsert__>, ...attachments: Attachment[]) {
    return await this.run(async (db) => {
      const id = document._id.toUpperCase()
      const old = await this.getDoc(id).catch(() => ({ _rev: undefined, _attachments: undefined }))
      const doc = old._rev
        ? { ...this.#schema.parse(document), _id: id, _rev: old._rev }
        : { ...this.#schema.parse(document), _id: id }

      const result = await db.put(doc)
      /* v8 ignore next 1 */ // Likely trigger by database corruption.
      if (!result.ok) throw new Error(`Failed to insert document "${doc._id}"`)
      if (attachments.length > 0) {
        await this.addAttachments(result.id, result.rev, attachments)
      } else if (document._attachments != null && document._attachments.length > 0) {
        await this.addAttachments(result.id, result.rev, document._attachments)
      } else if (old._attachments != null) {
        await this.addAttachments(result.id, result.rev, await prepareAttachments(old._attachments))
      }

      return await this.get(id)
    })
  }

  /** Updates an existing document in the database. */
  async update(document: Simplify<typeof this.__updates__>, ...attachments: Attachment[]) {
    return await this.run(async (db) => {
      const id = document._id.toUpperCase()
      const old = await this.getDoc(id)
      const doc = { ...this.#schema.parse({ ...old, ...document }), _id: id, _rev: old._rev }

      const result = await db.put(doc)
      /* v8 ignore next 1 */ // Likely trigger by database corruption.
      if (!result.ok) throw new Error(`Failed to insert document "${doc._id}"`)
      if (attachments.length > 0) {
        await this.addAttachments(result.id, result.rev, attachments)
      } else if (document._attachments != null && document._attachments.length > 0) {
        await this.addAttachments(result.id, result.rev, document._attachments)
      } else if (old._attachments != null) {
        await this.addAttachments(result.id, result.rev, await prepareAttachments(old._attachments))
      }

      return await this.get(id)
    })
  }

  /** Replaces an existing document, or inserts a new one, with the given ID  */
  async replace(document: Simplify<typeof this.__upsert__>, ...attachments: Attachment[]) {
    return await this.run(async (db) => {
      const id = document._id.toUpperCase()
      const old = await this.getDoc(id).catch(() => ({ _rev: undefined, _attachments: undefined }))
      const doc = old._rev
        ? { ...this.#schema.parse(document), _id: id, _rev: old._rev }
        : { ...this.#schema.parse(document), _id: id }

      const result = await db.put(doc)
      // Unlike upsert, we don't transfer the existing attachments in the database to the new revision.
      /* v8 ignore next 1 */ // Likely trigger by database corruption.
      if (!result.ok) throw new Error(`Failed to insert document "${doc._id}"`)
      if (attachments.length > 0) {
        await this.addAttachments(result.id, result.rev, attachments)
      } else if (document._attachments != null && document._attachments.length > 0) {
        await this.addAttachments(result.id, result.rev, document._attachments)
      }

      return await this.get(id)
    })
  }

  /** Removes a document from the database. */
  async remove(id: DocumentId, rev?: RevisionId) {
    await this.run(async (db) => {
      const revId = rev ? rev : (await this.getDoc(id))._rev
      await db.remove(id, revId)
    })
  }

  /** Removes all documents from the database. */
  async clear() {
    await this.run(async (db) => {
      const docs = await this.allDocs()
      await Promise.all(
        docs.map(async ({ _id, _rev }) => {
          await this.remove(_id, _rev)
        })
      )
      await db.compact()
    })
  }

  /** Deletes all data related to the database. */
  async destroy() {
    await this.run(async (db) => {
      await db.destroy()
    })
  }

  /** Closes the database. */
  async close() {
    await this.run(async (db) => {
      await db.close()
    })
  }
}
