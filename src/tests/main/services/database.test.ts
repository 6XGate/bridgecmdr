import { map, memo, omit } from 'radash'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { z } from 'zod'
import { Database } from '../../../main/services/database'
import { Attachment } from '@/attachments'

const mock = await vi.hoisted(async () => await import('../../support/mock'))
const port = await vi.hoisted(async () => await import('../../support/serial'))

beforeAll(() => {
  vi.mock('electron', mock.electronModule('database'))
  vi.mock('serialport', port.serialPortModule)
})

const kUuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/u
const kRevPattern = /^[0-9]-[0-9a-f]{32}$/u
const Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite()
})

let database: Database<typeof Schema>
beforeEach(async () => {
  const indices = [[['x']], { r: ['y', 'z'] }]
  const useDatabase = memo(() => new Database('db', Schema, ...indices))
  database = useDatabase()

  await database.clear()
})

test('test creation', () => {
  expect(database).toBeTypeOf('object')
  expect(database).not.toBeNull()
})

test('compacting', async () => {
  await expect(database.compact()).resolves.toBeUndefined()
})

describe('query', () => {
  let rawDocs: Awaited<ReturnType<typeof database.add>>[]
  const rawInputs = [
    { x: 1, y: 2, z: 3 },
    { x: 2, y: 3, z: 4 },
    { x: 3, y: 4, z: 5 },
    { x: 4, y: 5, z: 6 }
  ]

  beforeEach(async () => {
    rawDocs = await map(rawInputs, async (input) => await database.add(input))
  })

  test('all documents', async () => {
    const docs = await database.all()
    for (const doc of docs) {
      expect(doc._id).toMatch(kUuidPattern)
      expect(doc._rev).toMatch(kRevPattern)
      expect(doc._attachments).toBeInstanceOf(Array)
      expect(doc._attachments.length).toBe(0)
      expect(rawDocs).toContainEqual(doc)
    }
  })

  test('single documents', async () => {
    for (const rawDoc of rawDocs) {
      // eslint-disable-next-line no-await-in-loop -- Should be serialized.
      const doc = await database.get(rawDoc._id)
      expect(doc._id).toMatch(kUuidPattern)
      expect(doc._rev).toMatch(kRevPattern)
      expect(doc._attachments).toBeInstanceOf(Array)
      expect(doc._attachments.length).toBe(0)
      expect(rawDocs).toContainEqual(doc)
    }
  })
})

describe('adding document', () => {
  test('just document', async () => {
    const raw = { x: 3, y: 4, z: 5 }
    const doc = await database.add(raw)
    expect(doc._id).toMatch(kUuidPattern)
    expect(doc._rev).toMatch(kRevPattern)
    expect(doc._attachments).toStrictEqual([])
    expect(doc).toStrictEqual({
      ...raw,
      _id: doc._id,
      _rev: doc._rev,
      _attachments: doc._attachments
    })
  })

  test('with attachments', async () => {
    const raw = { x: 3, y: 4, z: 5 }
    const file = new File([Buffer.from('hello')], 'hello.txt', { type: 'text/plain' })
    const attachment = await Attachment.fromFile(file)
    const doc = await database.add(raw, attachment)
    expect(doc._id).toMatch(kUuidPattern)
    expect(doc._rev).toMatch(kRevPattern)
    expect(doc).toStrictEqual({
      ...raw,
      _id: doc._id,
      _rev: doc._rev,
      _attachments: [attachment]
    })
  })
})

describe('updating document', () => {
  let raw: { x: number; y: number; z: number }
  let attachment: Attachment
  let doc: Awaited<ReturnType<typeof database.add>>
  beforeEach(async () => {
    raw = { x: 3, y: 4, z: 5 }
    const file = new File([Buffer.from('hello')], 'hello.txt', { type: 'text/plain' })
    attachment = await Attachment.fromFile(file)
    doc = await database.add(raw)
  })

  test('just document', async () => {
    const changes = { y: 14 }
    const updated = await database.update({ _id: doc._id, ...changes })
    expect(updated._rev).toMatch(kRevPattern)
    expect(updated).toStrictEqual({
      ...raw,
      ...changes,
      _id: doc._id,
      _rev: updated._rev,
      _attachments: doc._attachments
    })
  })

  describe('with attachments', () => {
    test('as parameter', async () => {
      const changes = { y: 14 }
      const updated = await database.update({ _id: doc._id, ...changes }, attachment)
      expect(updated._rev).toMatch(kRevPattern)
      expect(updated).toStrictEqual({
        ...raw,
        ...changes,
        _id: doc._id,
        _rev: updated._rev,
        _attachments: [attachment]
      })
    })

    test('existing on update payload', async () => {
      const attached = await database.update({ _id: doc._id, y: 11 }, attachment)

      const changes = { ...attached, y: 14 }
      const updated = await database.update({ ...changes })
      expect(updated._rev).toMatch(kRevPattern)
      expect(updated).toStrictEqual({
        ...raw,
        ...changes,
        _id: doc._id,
        _rev: updated._rev,
        _attachments: [attachment]
      })
    })

    test('existing in database', async () => {
      await expect(database.update({ _id: doc._id, y: 11 }, attachment)).resolves.toBeTruthy()

      const changes = { ...doc, y: 14 }
      const updated = await database.update({ ...changes })
      expect(updated._rev).toMatch(kRevPattern)
      expect(updated).toStrictEqual({
        ...raw,
        ...changes,
        _id: doc._id,
        _rev: updated._rev,
        _attachments: [attachment]
      })
    })
  })

  test('strips unknown fields', async () => {
    const changes = { y: 14, a: 5 }
    const updated = await database.update({ _id: doc._id, ...changes })
    expect(updated._rev).toMatch(kRevPattern)
    expect(updated).toStrictEqual({
      ...raw,
      ...omit(changes, ['a']),
      _id: doc._id,
      _rev: updated._rev,
      _attachments: doc._attachments
    })
  })
})

test('removing document', async () => {
  const raw = { x: 3, y: 4, z: 5 }
  const doc = await database.add(raw)
  await expect(database.remove(doc._id)).resolves.toBeUndefined()
  await expect(database.get(doc._id)).rejects.toThrow('missing')
})

test('clearing database', async () => {
  const inputs = [
    { x: 1, y: 2, z: 3 },
    { x: 2, y: 3, z: 4 },
    { x: 3, y: 4, z: 5 },
    { x: 4, y: 5, z: 6 }
  ]

  const docs = await map(inputs, async (input) => await database.add(input))

  await expect(database.clear()).resolves.toBeUndefined()
  await Promise.all(
    docs.map(async (doc) => {
      await expect(database.get(doc._id)).rejects.toThrow('missing')
    })
  )
})
