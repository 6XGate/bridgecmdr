import { describe, expect, test } from 'vitest'
import { asMicrotask, isNotNullish, toArray, toObjectPath, withResolvers } from '@/basics'

test('isNotNullish', () => {
  expect(isNotNullish(undefined)).toBe(false)
  expect(isNotNullish(null)).toBe(false)
  expect(isNotNullish(false)).toBe(true)
  expect(isNotNullish('')).toBe(true)
  expect(isNotNullish(Number.NaN)).toBe(true)
})

test('toArray', () => {
  expect(toArray(undefined)).toStrictEqual([])
  expect(toArray(null)).toStrictEqual([])
  expect(toArray(5)).toStrictEqual([5])
  expect(toArray('test')).toStrictEqual(['test'])
  expect(toArray([undefined])).toStrictEqual([undefined])
  expect(toArray([null])).toStrictEqual([null])
  expect(toArray([5])).toStrictEqual([5])
  expect(toArray(['test'])).toStrictEqual(['test'])
})

describe('withResolvers', () => {
  test('resolve', async () => {
    const { promise, resolve } = withResolvers<5>()
    setTimeout(() => {
      resolve(5)
    }, 10)
    await expect(promise).resolves.toStrictEqual(5)
  })

  test('reject', async () => {
    const { promise, reject } = withResolvers<never>()
    setTimeout(() => {
      reject(new Error('test'))
    }, 10)
    await expect(promise).rejects.toThrow('test')
  })
})

describe('asMicrotask', () => {
  describe('synchronous', () => {
    test('resolve', async () => {
      await expect(asMicrotask(() => 5)).resolves.toBe(5)
    })

    test('reject', async () => {
      await expect(
        asMicrotask(() => {
          throw new Error('test')
        })
      ).rejects.toThrow('test')
    })
  })

  describe('asynchronous', () => {
    test('resolve', async () => {
      await expect(asMicrotask(async () => await Promise.resolve(5))).resolves.toBe(5)
    })

    test('reject', async () => {
      await expect(asMicrotask(async () => await Promise.reject(new Error('test')))).rejects.toThrow('test')
    })
  })
})

test('toObjectPath', () => {
  expect(toObjectPath(['settings'])).toBe('settings')
  expect(toObjectPath(['documents', 5])).toBe('documents[5]')
  expect(toObjectPath(['node', 'parent'])).toBe('node.parent')
  expect(toObjectPath(['nodes', 5, 'parent'])).toBe('nodes[5].parent')
  expect(toObjectPath([5, 'status'])).toBe('[5].status')
  expect(toObjectPath([5])).toBe('[5]')
})
