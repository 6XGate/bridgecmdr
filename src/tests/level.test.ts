import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

const mock = await vi.hoisted(async () => await import('./support/mock'))

beforeEach(async () => {
  vi.mock(import('electron'), mock.electronModule)
  vi.mock(import('electron-log'))
  await mock.bridgeCmdrBasics()
  const { default: useLevelServer } = await import('../main/system/level')
  useLevelServer()
})

afterEach(async () => {
  await globalThis.services.freeAllHandles()
  vi.resetModules()
})

test('basics', async () => {
  const { useLevelDb } = await import('../renderer/data/level')

  const { levelup } = useLevelDb()
  const connectSpy = vi.fn(levelup)

  const db = await connectSpy('test')
  expect(connectSpy).toHaveResolved()

  await expect(db.put('test', 'test')).resolves.toBeUndefined()
  await expect(db.get('test')).resolves.toEqual(Buffer.from('test'))
  await expect(db.close()).resolves.toBeUndefined()
})

describe('forbidden names', () => {
  test('ending in ":close"', async () => {
    const { useLevelDb } = await import('../renderer/data/level')
    const { connect } = useLevelDb()

    await expect(connect('test:close')).rejects.toThrowError("Database names cannot end in ':close'")
    await expect(connect('test/close')).rejects.toThrowError(
      'Only a file name, without extension or relative path, may be specified'
    )
  })
})
