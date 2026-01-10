import { memo, shake } from 'radash'
import { z } from 'zod'
import { transaction } from '../repos/database'
import { useImageRepository } from '../repos/images'
import { useSourceRepository } from '../repos/sources'
import { useTieRepository } from '../repos/ties'
import { Database, inferDocumentOf, inferNewDocumentOf, inferUpdatesOf, inferUpsertOf } from '../services/database'
import useTiesDatabase from './ties'
import type { Image } from '../repos/images'
import type { DocumentId, RevisionId } from '../services/database'
import type { UUID } from 'crypto'
import { Attachment } from '@/attachments'

export const SourceModel = z.object({
  order: z.number().nonnegative().finite(),
  title: z.string().min(1),
  image: z.string().min(1).nullable()
})

type SourceDoc = inferDocumentOf<typeof SourceModel>
type NewSourceDoc = inferNewDocumentOf<typeof SourceModel>
type SourceUpdateDoc = inferUpdatesOf<typeof SourceModel>
type SourceUpsertDoc = inferUpsertOf<typeof SourceModel>

function toAttachment(image: Image): Attachment {
  return new Attachment(image.id, image.type, image.data)
}

class SourceDao {
  private readonly repository = useSourceRepository()
  private readonly images = useImageRepository()
  private readonly ties = useTieRepository()

  async compact() {
    await Promise.resolve() // Compatibility.
  }

  async all(): Promise<SourceDoc[]> {
    const sources = await this.repository.all()
    const images = await this.images.all()

    return sources.map(function (source) {
      const image = images.find((img) => img.id === source.image)
      return {
        _id: source.id,
        _rev: '0', // Dummy revision for compatibility.
        order: 0, // Dummy order for compatibility.
        title: source.title,
        image: image ? image.id : null,
        _attachments: image ? [new Attachment(image.id, image.type, image.data)] : []
      }
    })
  }

  async get(id: string): Promise<SourceDoc> {
    const source = await this.repository.findById(id as UUID)
    if (!source) throw new Error('Source not found')

    const image = source.image ? await this.images.findById(source.image) : null
    return {
      _id: source.id,
      _rev: '0', // Dummy revision for compatibility.
      order: 0, // Dummy order for compatibility.
      title: source.title,
      image: image ? image.id : null,
      _attachments: image ? [new Attachment(image.id, image.type, image.data)] : []
    }
  }

  private async upsertImage(
    payload: NewSourceDoc | SourceUpdateDoc,
    attachments: Attachment[]
  ): Promise<Image | null | undefined> {
    const attachment = attachments.find((att) => att.name === payload.image)
    let image
    if (attachment) {
      image = await this.images.upsert({
        data: Buffer.from(attachment),
        type: attachment.type
      })
    } else if (payload.image === null) {
      image = null
    }

    return image
  }

  async add(payload: NewSourceDoc, ...attachments: Attachment[]): Promise<SourceDoc> {
    return await transaction(async () => {
      let image = await this.upsertImage(payload, attachments)
      const source = await this.repository.insert({
        title: payload.title,
        image: image?.id ?? null
      })

      if (source.image != null && image == null) {
        image = await this.images.findById(source.image)
      }

      return {
        _id: source.id,
        _rev: '0', // Dummy revision for compatibility.
        order: 0, // Dummy order for compatibility.
        title: source.title,
        image: image?.id ?? null,
        _attachments: image ? [toAttachment(image)] : []
      }
    })
  }

  async update(payload: SourceUpdateDoc, ...attachments: Attachment[]): Promise<SourceDoc> {
    return await transaction(async () => {
      let image = await this.upsertImage(payload, attachments)
      const source = await this.repository.updateById(
        payload._id as UUID,
        shake({
          title: payload.title,
          image: image?.id
        })
      )

      if (source.image != null && image == null) {
        image = await this.images.findById(source.image)
      }

      return {
        _id: source.id,
        _rev: '0', // Dummy revision for compatibility.
        order: 0, // Dummy order for compatibility.
        title: source.title,
        image: image?.id ?? null,
        _attachments: image ? [toAttachment(image)] : []
      }
    })
  }

  async upsert(payload: SourceUpsertDoc, ...attachments: Attachment[]): Promise<SourceDoc> {
    return await transaction(async () => {
      let image = await this.upsertImage(payload, attachments)

      const source = await this.repository.upsert({
        id: payload._id as UUID,
        title: payload.title,
        image: image?.id ?? null
      })

      if (source.image != null && image == null) {
        image = await this.images.findById(source.image)
      }

      return {
        _id: source.id,
        _rev: '0', // Dummy revision for compatibility.
        order: 0, // Dummy order for compatibility.
        title: source.title,
        image: image?.id ?? null,
        _attachments: image ? [toAttachment(image)] : []
      }
    })
  }

  async remove(id: string, _?: unknown): Promise<void> {
    await transaction(async () => {
      const source = await this.repository.deleteById(id as UUID)
      await this.ties.deleteBySourceId(source.id)
    })
  }

  async clear() {
    await transaction(async () => {
      await this.ties.deleteAll()
      await this.repository.deleteAll()
    })
  }

  async getNextOrderValue() {
    // Just return a dummy value for compatibility.
    return await this.repository.all().then((sources) => sources.length)
  }

  async normalizeOrder() {
    await Promise.resolve() // Compatibility.
  }
}

export const useSourceDao = memo(() => new SourceDao())

const useSourcesDatabase = memo(
  () =>
    new (class extends Database.of('sources', SourceModel) {
      readonly #ties = useTiesDatabase()

      async getNextOrderValue() {
        return await this.run(async function getNextOrderValue(db) {
          const mapped = await db.query<number>({
            /* v8 ignore next 2 */ // Not executed in a way V8 can see.
            map: (doc, emit) => emit?.(doc.order, doc.order),
            reduce: (_, values) => 1 + Math.max(...values.map(Number))
          })

          const row = mapped.rows[0]
          if (row == null) return 0

          return row.value as number
        })
      }

      async normalizeOrder() {
        const sources = await this.all()
        let i = 0
        for (const source of sources.toSorted((a, b) => a.order - b.order)) {
          source.order = i
          i += 1
        }

        await Promise.all(
          sources.map(async (source) => {
            await this.update(source)
          })
        )
      }

      override async remove(id: DocumentId, rev?: RevisionId) {
        await super.remove(id, rev)

        const related = await this.#ties.forSource(id)
        await Promise.all(
          related.map(async ({ _id, _rev }) => {
            await this.#ties.remove(_id, _rev)
          })
        )
      }
    })()
)

export type Source = inferDocumentOf<typeof SourceModel>
export const Source = inferDocumentOf(SourceModel)
export type NewSource = inferNewDocumentOf<typeof SourceModel>
export const NewSource = inferNewDocumentOf(SourceModel)
export type SourceUpdate = inferUpdatesOf<typeof SourceModel>
export const SourceUpdate = inferUpdatesOf(SourceModel)
export type SourceUpsert = inferUpsertOf<typeof SourceModel>
export const SourceUpsert = inferUpsertOf(SourceModel)

export default useSourcesDatabase
