import { test, expect, vi, beforeEach, afterEach } from 'vitest'

const mock = await vi.hoisted(async () => await import('./support/mock'))

beforeEach(() => {
  vi.mock('electron', mock.electronModule)
  vi.mock('electron-log', mock.elctronLogModule)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
})

test('basics', async () => {
  const { useLevelDb } = await import('../main/services/level')

  const { levelup } = useLevelDb()
  const connectSpy = vi.fn(levelup)

  const db = await connectSpy('test')
  expect(connectSpy).toHaveResolved()

  await expect(db.put('test', 'test')).resolves.toBeUndefined()
  await expect(db.get('test')).resolves.toEqual(Buffer.from('test'))
  await expect(db.close()).resolves.toBeUndefined()
})
