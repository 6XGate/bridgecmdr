import { omit } from 'radash'
import { beforeAll, expect, test, vi } from 'vitest'
import { z } from 'zod'
import { Source } from '../../../main/dao/sources'
import useZod from '../../support/vitestZod'

const mock = await vi.hoisted(async () => await import('../../support/mock'))

beforeAll(() => {
  vi.mock('electron', mock.electronModule('boot'))
  vi.mock('electron-log', mock.electronLogModule)
  // Disable memoize caching.
  vi.mock('radash', async (original) => ({
    ...(await original()),
    memo: (x: unknown) => x
  }))

  useZod()
})

test('migration', async () => {
  const { seedForBoot } = await import('../../seeds/boot.seed')
  const { sources } = await seedForBoot()

  const { default: useBootOperations } = await import('../../../main/services/boot')

  const boot = useBootOperations()
  await boot()

  const { default: useSourcesDatabase } = await import('../../../main/dao/sources')

  const sourceDao = useSourcesDatabase()

  const booted = {
    sources: await sourceDao.all()
  }

  expect(booted.sources).toMatchSchema(z.array(Source))
  for (const source of booted.sources) {
    expect(Number.isSafeInteger(source.order), 'Expected source.order to be an integer').toBe(true)
  }

  expect(booted.sources).toMatchObject(sources.map((source) => omit(source, ['order', '_rev'])))

  await sourceDao.close()
})
