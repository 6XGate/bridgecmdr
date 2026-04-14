import { map, memo, shake } from 'radash'
import { z } from 'zod'
import { useTieRepository } from '../repos/ties'
import {
  Database,
  DocumentId,
  inferDocumentOf,
  inferNewDocumentOf,
  inferUpdatesOf,
  inferUpsertOf
} from '../services/database'
import type { UUID } from 'node:crypto'

export const TieModel = z.object({
  sourceId: DocumentId,
  deviceId: DocumentId,
  inputChannel: z.number().int().nonnegative(),
  outputChannels: z.object({
    video: z.number().int().nonnegative().optional(),
    audio: z.number().int().nonnegative().optional()
  })
})

type TieDoc = inferDocumentOf<typeof TieModel>
type NewTieDoc = inferNewDocumentOf<typeof TieModel>
type TieUpdateDoc = inferUpdatesOf<typeof TieModel>
type TieUpsertDoc = inferUpsertOf<typeof TieModel>

class TieDao {
  private readonly repository = useTieRepository()

  async compact() {
    await Promise.resolve() // Compatibility.
  }

  async all(): Promise<TieDoc[]> {
    const ties = await this.repository.all()
    return ties.map((tie) => ({
      _id: tie.id,
      _rev: '0', // Dummy revision for compatibility.
      sourceId: tie.sourceId,
      deviceId: tie.deviceId,
      inputChannel: tie.inputChannel,
      outputChannels: {
        video: tie.outputVideoChannel ?? undefined,
        audio: tie.outputAudioChannel ?? undefined
      },
      _attachments: []
    }))
  }

  async get(id: string): Promise<TieDoc> {
    const tie = await this.repository.findById(id as UUID)
    if (!tie) throw new Error('Tie not found')

    return {
      _id: tie.id,
      _rev: '0', // Dummy revision for compatibility.
      sourceId: tie.sourceId,
      deviceId: tie.deviceId,
      inputChannel: tie.inputChannel,
      outputChannels: {
        video: tie.outputVideoChannel ?? undefined,
        audio: tie.outputAudioChannel ?? undefined
      },
      _attachments: []
    }
  }

  async add(payload: NewTieDoc): Promise<TieDoc> {
    const tie = await this.repository.insert({
      sourceId: payload.sourceId as UUID,
      deviceId: payload.deviceId as UUID,
      inputChannel: payload.inputChannel,
      outputVideoChannel: payload.outputChannels.video ?? null,
      outputAudioChannel: payload.outputChannels.audio ?? null
    })

    return {
      _id: tie.id,
      _rev: '0', // Dummy revision for compatibility.
      sourceId: tie.sourceId,
      deviceId: tie.deviceId,
      inputChannel: tie.inputChannel,
      outputChannels: {
        video: tie.outputVideoChannel ?? undefined,
        audio: tie.outputAudioChannel ?? undefined
      },
      _attachments: []
    }
  }

  async update(payload: TieUpdateDoc): Promise<TieDoc> {
    const tie = await this.repository.updateById(
      payload._id as UUID,
      shake({
        sourceId: payload.sourceId as UUID | undefined,
        deviceId: payload.deviceId as UUID | undefined,
        inputChannel: payload.inputChannel,
        outputVideoChannel: payload.outputChannels?.video,
        outputAudioChannel: payload.outputChannels?.audio
      })
    )

    return {
      _id: tie.id,
      _rev: '0', // Dummy revision for compatibility.
      sourceId: tie.sourceId,
      deviceId: tie.deviceId,
      inputChannel: tie.inputChannel,
      outputChannels: {
        video: tie.outputVideoChannel ?? undefined,
        audio: tie.outputAudioChannel ?? undefined
      },
      _attachments: []
    }
  }

  async upsert(payload: TieUpsertDoc): Promise<TieDoc> {
    const tie = await this.repository.upsert({
      id: payload._id as UUID,
      sourceId: payload.sourceId as UUID,
      deviceId: payload.deviceId as UUID,
      inputChannel: payload.inputChannel,
      outputVideoChannel: payload.outputChannels.video ?? null,
      outputAudioChannel: payload.outputChannels.audio ?? null
    })

    return {
      _id: tie.id,
      _rev: '0', // Dummy revision for compatibility.
      sourceId: tie.sourceId,
      deviceId: tie.deviceId,
      inputChannel: tie.inputChannel,
      outputChannels: {
        video: tie.outputVideoChannel ?? undefined,
        audio: tie.outputAudioChannel ?? undefined
      },
      _attachments: []
    }
  }

  async remove(id: string): Promise<void> {
    await this.repository.deleteById(id as UUID)
  }

  async forDevice(deviceId: string): Promise<TieDoc[]> {
    const ties = await this.repository.findByDeviceId(deviceId as UUID)
    return ties.map((tie) => ({
      _id: tie.id,
      _rev: '0', // Dummy revision for compatibility.
      sourceId: tie.sourceId,
      deviceId: tie.deviceId,
      inputChannel: tie.inputChannel,
      outputChannels: {
        video: tie.outputVideoChannel ?? undefined,
        audio: tie.outputAudioChannel ?? undefined
      },
      _attachments: []
    }))
  }

  async forSource(sourceId: string): Promise<TieDoc[]> {
    const ties = await this.repository.findBySourceId(sourceId as UUID)
    return ties.map((tie) => ({
      _id: tie.id,
      _rev: '0', // Dummy revision for compatibility.
      sourceId: tie.sourceId,
      deviceId: tie.deviceId,
      inputChannel: tie.inputChannel,
      outputChannels: {
        video: tie.outputVideoChannel ?? undefined,
        audio: tie.outputAudioChannel ?? undefined
      },
      _attachments: []
    }))
  }

  async clear(): Promise<void> {
    await this.repository.deleteAll()
  }
}

export const useTieDao = memo(() => new TieDao())

const indices = { sourceId: ['sourceId'], deviceId: ['deviceId'] }

const useTiesDatabase = memo(
  () =>
    new (class extends Database.of('ties', TieModel, indices) {
      async forDevice(deviceId: DocumentId) {
        return await this.run(
          async (db) =>
            await db
              .find({ selector: { deviceId } })
              .then(async (r) => await map(r.docs, async (d) => await this.prepare(d)))
        )
      }

      async forSource(sourceId: DocumentId) {
        return await this.run(
          async (db) =>
            await db
              .find({ selector: { sourceId } })
              .then(async (r) => await map(r.docs, async (d) => await this.prepare(d)))
        )
      }
    })()
)

export type Tie = inferDocumentOf<typeof TieModel>
export const Tie = inferDocumentOf(TieModel)
export type NewTie = inferNewDocumentOf<typeof TieModel>
export const NewTie = inferNewDocumentOf(TieModel)
export type TieUpdate = inferUpdatesOf<typeof TieModel>
export const TieUpdate = inferUpdatesOf(TieModel)
export type TieUpsert = inferUpsertOf<typeof TieModel>
export const TieUpsert = inferUpsertOf(TieModel)

export default useTiesDatabase
