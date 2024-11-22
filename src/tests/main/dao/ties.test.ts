import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import useTiesDatabase from '../../../main/dao/ties'
import { seedDatabase } from '../../seeds/database.seed'
import type { NewTie } from '../../../main/dao/ties'
import { Attachment } from '@/attachments'

const mock = await vi.hoisted(async () => await import('../../support/mock'))

beforeAll(() => {
  vi.mock('electron', mock.electronModule('ties'))
  vi.mock('electron-log', mock.electronLogModule)
})

let database: Awaited<ReturnType<typeof seedDatabase>>
let tiesDao: ReturnType<typeof useTiesDatabase>

beforeEach(async () => {
  database = await seedDatabase()
  tiesDao = useTiesDatabase()
})

test('compacting', async () => {
  await expect(tiesDao.compact()).resolves.toBeUndefined()
})

describe('query', () => {
  test('all', async () => {
    await expect(tiesDao.all()).resolves.toStrictEqual(database.ties)
  })

  test('single', async () => {
    await Promise.all(
      database.ties.map(async (item) => {
        await expect(tiesDao.get(item._id)).resolves.toStrictEqual(item)
      })
    )
  })
})

const kUuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/u
const kRevPattern = /^[0-9]-[0-9a-f]{32}$/u

test('adding', async () => {
  const file = new File([Buffer.from('hello')], 'hello.txt', { type: 'text/plain' })
  const attachment = await Attachment.fromFile(file)
  const raw = {
    sourceId: database.sources[2]._id,
    deviceId: database.devices[1]._id,
    inputChannel: 3,
    outputChannels: { video: 6 }
  } satisfies NewTie
  const doc = await tiesDao.add(raw, attachment)

  expect(doc._id).toMatch(kUuidPattern)
  expect(doc._rev).toMatch(kRevPattern)
  expect(doc).toStrictEqual({
    ...raw,
    _id: doc._id,
    _rev: doc._rev,
    _attachments: [attachment]
  })
})

test('updating', async () => {
  const tie = database.ties[0]
  const changes = { inputChannel: 4 }
  const updated = await tiesDao.update({ _id: tie._id, ...changes })
  expect(updated._rev).toMatch(kRevPattern)
  expect(updated).toStrictEqual({
    ...tie,
    ...changes,
    _id: tie._id,
    _rev: updated._rev,
    _attachments: tie._attachments
  })
})

test('removing', async () => {
  const tie = database.ties[1]
  await expect(tiesDao.remove(tie._id)).resolves.toBeUndefined()
  await expect(tiesDao.get(tie._id)).rejects.toThrow('missing')
  await expect(tiesDao.forSource(tie._id)).resolves.toHaveLength(0)
})

test('clearing', async () => {
  await expect(tiesDao.all()).resolves.toHaveLength(database.ties.length)
  await expect(tiesDao.clear()).resolves.toBeUndefined()
  await Promise.all(
    database.ties.map(async (doc) => {
      await expect(tiesDao.get(doc._id)).rejects.toThrow('missing')
    })
  )
  await expect(tiesDao.all()).resolves.toHaveLength(0)
})
