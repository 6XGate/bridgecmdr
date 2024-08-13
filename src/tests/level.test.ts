import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'

const mock = await vi.hoisted(async () => await import('./support/mock.js'))

beforeEach(async () => {
  vi.mock(import('electron'), mock.electronModule)
  vi.mock(import('electron-log'))
  await mock.bridgeCmdrBasics()
  const { default: useLevelServer } = await import('../main/system/level.js')
  useLevelServer()
})

afterEach(async () => {
  await globalThis.api.freeAllHandles()
  vi.resetModules()
})

test('basics', async () => {
  const { useLevelDb } = await import('../renderer/data/level.js')

  const { connect } = useLevelDb()
  const connectSpy = vi.fn(connect)

  const db = await connectSpy('logs/test')
  expect(connectSpy).toHaveResolved()

  await expect(db.put('test', 'test')).resolves.toBeUndefined()
  await expect(db.get('test')).resolves.toEqual('test')
  await expect(db.close()).resolves.toBeUndefined()
})

describe('forbidden names', () => {
  test('ending in ":close"', async () => {
    const { useLevelDb } = await import('../renderer/data/level.js')
    const { connect } = useLevelDb()

    await expect(connect('test:close')).rejects.toThrowError("Database names cannot end in ':close'")
  })
})
