import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import useSourcesDatabase from '../../../main/dao/sources'
import useTiesDatabase from '../../../main/dao/ties'
import { seedDatabase } from '../../seeds/database.seed'
import type { NewSource } from '../../../main/dao/sources'
import { Attachment } from '@/attachments'

const mock = await vi.hoisted(async () => await import('../../support/mock'))

beforeAll(() => {
  vi.mock('electron', mock.electronModule('sources'))
  vi.mock('electron-log', mock.electronLogModule)
})

let database: Awaited<ReturnType<typeof seedDatabase>>
let sourcesDao: ReturnType<typeof useSourcesDatabase>
let tiesDao: ReturnType<typeof useTiesDatabase>

beforeEach(async () => {
  database = await seedDatabase()
  sourcesDao = useSourcesDatabase()
  tiesDao = useTiesDatabase()
})

test('compacting', async () => {
  await expect(sourcesDao.compact()).resolves.toBeUndefined()
})

describe('query', () => {
  test('all', async () => {
    await expect(sourcesDao.all()).resolves.toStrictEqual(database.sources)
  })

  test('single', async () => {
    await Promise.all(
      database.sources.map(async (item) => {
        await expect(sourcesDao.get(item._id)).resolves.toStrictEqual(item)
      })
    )
  })
})

const kUuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/u
const kRevPattern = /^[0-9]-[0-9a-f]{32}$/u

test('adding', async () => {
  const file = new File([Buffer.from('hello')], 'hello.txt', { type: 'text/plain' })
  const attachment = await Attachment.fromFile(file)
  const raw = { order: 3, title: 'NeoGeo', image: file.name } satisfies NewSource
  const doc = await sourcesDao.add(raw, attachment)

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
  const source = database.sources[0]
  const changes = { title: '3D0' }
  const updated = await sourcesDao.update({ _id: source._id, ...changes })
  expect(updated._rev).toMatch(kRevPattern)
  expect(updated).toStrictEqual({
    ...source,
    ...changes,
    _id: source._id,
    _rev: updated._rev,
    _attachments: source._attachments
  })
})

test('removing', async () => {
  const source = database.sources[1]
  await expect(sourcesDao.remove(source._id)).resolves.toBeUndefined()
  await expect(sourcesDao.get(source._id)).rejects.toThrow('missing')
  await expect(tiesDao.forSource(source._id)).resolves.toHaveLength(0)
})

test('clearing', async () => {
  await expect(sourcesDao.all()).resolves.toHaveLength(database.sources.length)
  await expect(tiesDao.all()).resolves.toHaveLength(database.ties.length)
  await expect(sourcesDao.clear()).resolves.toBeUndefined()
  await Promise.all(
    database.sources.map(async (doc) => {
      await expect(sourcesDao.get(doc._id)).rejects.toThrow('missing')
    })
  )
  await expect(sourcesDao.all()).resolves.toHaveLength(0)
  await expect(tiesDao.all()).resolves.toHaveLength(0)
})

describe('utilities', () => {
  describe('getNextOrderValue', () => {
    test('with documents', async () => {
      await expect(sourcesDao.getNextOrderValue()).resolves.toBe(3)
    })

    test('without documents', async () => {
      await sourcesDao.clear()
      await expect(sourcesDao.getNextOrderValue()).resolves.toBe(0)
    })
  })
})
