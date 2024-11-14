import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { withResolvers } from '@/basics'

const mock = await vi.hoisted(async () => await import('../../support/mock'))

beforeEach(() => {
  vi.mock('electron', mock.electronModule)
  vi.mock('electron-log', mock.elctronLogModule)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
})

test('basics', async () => {
  const { useLevelDb } = await import('../../../main/services/level')

  const { levelup } = useLevelDb()
  const connectSpy = vi.fn(levelup).mockName('levelup')

  const db = await connectSpy('test')
  expect(connectSpy).toHaveResolved()

  await expect(db.put('test', 'test')).resolves.toBeUndefined()
  await expect(db.get('test')).resolves.toStrictEqual(Buffer.from('test'))
  await expect(db.close()).resolves.toBeUndefined()
})

test('app exit', async () => {
  const { app } = await import('electron')
  const { useLevelDb } = await import('../../../main/services/level')

  const { leveldown } = useLevelDb()
  const db = leveldown('test')

  const { resolve, promise } = withResolvers()
  const closeSpy = vi.spyOn(db, 'close').mockName('db.close')
  app.on('will-quit', resolve)

  app.emit('will-quit')

  await promise
  expect(closeSpy).toHaveBeenCalledOnce()
})
