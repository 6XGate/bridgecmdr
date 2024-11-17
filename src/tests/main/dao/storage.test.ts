import { beforeAll, expect, test, vi } from 'vitest'
import type useUserStore from '../../../main/dao/storage'

const mock = await vi.hoisted(async () => await import('../../support/mock'))

let storage: ReturnType<typeof useUserStore>
beforeAll(async () => {
  vi.mock('electron', mock.electronModule('storage'))
  vi.mock('electron-log', mock.electronLogModule)
  storage = (await import('../../../main/dao/storage')).default()
})

test('general ', async () => {
  // Setting items.
  await storage.setItem('test-1', 'hello world 1')
  await storage.setItem('test-2', 'hello world 2')
  await storage.setItem('test-3', 'hello world 3')

  // Getting items.
  await expect(storage.getItem('test-1')).resolves.toBe('hello world 1')
  await expect(storage.getItem('test-2')).resolves.toBe('hello world 2')
  await expect(storage.getItem('test-3')).resolves.toBe('hello world 3')

  // Removing items.
  await expect(storage.removeItem('test-3')).resolves.toBeUndefined()

  // Checking remove, getting non-existent items.
  await expect(storage.getItem('test-3')).resolves.toBeNull()

  // Clearing storage.
  await expect(storage.clear()).resolves.toBeUndefined()

  // Checking clear, getting non-existent items.
  await expect(storage.getItem('test-1')).resolves.toBeNull()
  await expect(storage.getItem('test-2')).resolves.toBeNull()

  // Removing non-existent items.
  await expect(storage.removeItem('test-1')).resolves.toBeUndefined()
  await expect(storage.removeItem('test-2')).resolves.toBeUndefined()
})
