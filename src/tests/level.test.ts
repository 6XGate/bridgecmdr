import { test, expect, vi, beforeEach, afterEach } from 'vitest'

const mock = await vi.hoisted(async () => await import('./support/mock'))

beforeEach(async () => {
  vi.mock(import('electron'), mock.electronModule)
  vi.mock(import('electron-log'))
  await mock.bridgeCmdrBasics()
})

afterEach(async () => {
  await globalThis.services.freeAllHandles()
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
