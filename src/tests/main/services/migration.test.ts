import { omit } from 'radash'
import { beforeAll, expect, test, vi } from 'vitest'
import { z } from 'zod'
import { Device } from '../../../main/dao/devices'
import { Source } from '../../../main/dao/sources'
import { Tie } from '../../../main/dao/ties'
import useZod from '../../support/vitestZod'

const mock = await vi.hoisted(async () => await import('../../support/mock'))

beforeAll(() => {
  vi.mock('electron', mock.electronModule('migration'))
  vi.mock('electron-log', mock.electronLogModule)
  // Disable memoize caching.
  vi.mock('radash', async (original) => ({
    ...(await original()),
    memo: (x: unknown) => x
  }))

  useZod()
})

test('migration', async () => {
  const { seedForMigration } = await import('../../seeds/migration.seed')
  const { switches, sources, ties } = await seedForMigration()

  const { default: useMigrations } = await import('../../../main/services/migration')

  const migrate = useMigrations()
  await migrate()

  const { default: useDevicesDatabase } = await import('../../../main/dao/devices')
  const { default: useSourcesDatabase } = await import('../../../main/dao/sources')
  const { default: useTiesDatabase } = await import('../../../main/dao/ties')

  const deviceDao = useDevicesDatabase()
  const sourceDao = useSourcesDatabase()
  const tieDao = useTiesDatabase()

  const migrated = {
    devices: await deviceDao.all(),
    sources: await sourceDao.all(),
    ties: await tieDao.all()
  }

  expect(migrated.devices).toMatchSchema(z.array(Device))
  expect(migrated.sources).toMatchSchema(z.array(Source))
  expect(migrated.ties).toMatchSchema(z.array(Tie))

  expect(migrated.devices).toMatchObject(switches.map((device) => omit(device, ['_rev'])))
  expect(migrated.sources).toMatchObject(sources.map((source) => omit(source, ['_rev'])))
  expect(migrated.ties).toMatchObject(
    ties.map(({ switchId, ...tie }) => omit({ ...tie, deviceId: switchId }, ['_rev']))
  )

  await deviceDao.close()
  await sourceDao.close()
  await tieDao.close()
})

test('rerun migration', async () => {
  vi.resetModules()

  const { default: useMigrations } = await import('../../../main/services/migration')

  const migrate = useMigrations()
  await expect(migrate()).resolves.toBeUndefined()
})
