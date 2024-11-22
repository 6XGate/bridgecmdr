import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import useDevicesDatabase from '../../../main/dao/devices'
import useTiesDatabase from '../../../main/dao/ties'
import { seedDatabase } from '../../seeds/database.seed'
import type { NewDevice } from '../../../main/dao/devices'
import { Attachment } from '@/attachments'

const mock = await vi.hoisted(async () => await import('../../support/mock'))

beforeAll(() => {
  vi.mock('electron', mock.electronModule('devices'))
  vi.mock('electron-log', mock.electronLogModule)
})

let database: Awaited<ReturnType<typeof seedDatabase>>
let devicesDao: ReturnType<typeof useDevicesDatabase>
let tiesDao: ReturnType<typeof useTiesDatabase>

beforeEach(async () => {
  database = await seedDatabase()
  devicesDao = useDevicesDatabase()
  tiesDao = useTiesDatabase()
})

test('compacting', async () => {
  await expect(devicesDao.compact()).resolves.toBeUndefined()
})

describe('query', () => {
  test('all', async () => {
    await expect(devicesDao.all()).resolves.toStrictEqual(database.devices)
  })

  test('single', async () => {
    await Promise.all(
      database.devices.map(async (item) => {
        await expect(devicesDao.get(item._id)).resolves.toStrictEqual(item)
      })
    )
  })
})

const kUuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/u
const kRevPattern = /^[0-9]-[0-9a-f]{32}$/u

test('adding', async () => {
  const file = new File([Buffer.from('hello')], 'hello.txt', { type: 'text/plain' })
  const attachment = await Attachment.fromFile(file)
  const raw = { title: 'Extron', driverId: database.extronSis.guid, path: 'ip:192.168.10.2' } satisfies NewDevice
  const doc = await devicesDao.add(raw, attachment)

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
  const device = database.devices[0]
  const changes = { title: 'Extron RGBHVA 128pro' }
  const updated = await devicesDao.update({ _id: device._id, ...changes })
  expect(updated._rev).toMatch(kRevPattern)
  expect(updated).toStrictEqual({
    ...device,
    ...changes,
    _id: device._id,
    _rev: updated._rev,
    _attachments: device._attachments
  })
})

test('removing', async () => {
  const device = database.devices[1]
  await expect(devicesDao.remove(device._id)).resolves.toBeUndefined()
  await expect(devicesDao.get(device._id)).rejects.toThrow('missing')
  await expect(tiesDao.forSource(device._id)).resolves.toHaveLength(0)
})

test('clearing', async () => {
  await expect(devicesDao.all()).resolves.toHaveLength(database.devices.length)
  await expect(tiesDao.all()).resolves.toHaveLength(database.ties.length)
  await expect(devicesDao.clear()).resolves.toBeUndefined()
  await Promise.all(
    database.devices.map(async (doc) => {
      await expect(devicesDao.get(doc._id)).rejects.toThrow('missing')
    })
  )
  await expect(devicesDao.all()).resolves.toHaveLength(0)
  await expect(tiesDao.all()).resolves.toHaveLength(0)
})
