import { assert, describe, expect, test, vi } from 'vitest'
import { z } from 'zod'
import * as mock from '../support/mock'
import {
  getMessage,
  getZodMessage,
  logPromiseFailures,
  raiseError,
  toError,
  warnPromiseFailures
} from '@/error-handling'

describe('getZodMessage', () => {
  test('failed scalar parsing', () => {
    const badBasicData = 'text'
    const badResult = z.literal('test').safeParse(badBasicData)
    assert(!badResult.success, 'Expected `!badResult.success`, got `badResult.success`')
    const zodError = badResult.error

    expect(getZodMessage(zodError)).toBe(zodError.errors[0]?.message)
  })

  test('failed object parsing', () => {
    const badBasicData = { type: 'text' }
    const badResult = z.object({ type: z.literal('test') }).safeParse(badBasicData)
    assert(!badResult.success, 'Expected `!badResult.success`, got `badResult.success`')
    const zodError = badResult.error

    expect(getZodMessage(zodError)).toBe(`type: ${zodError.errors[0]?.message}`)
  })
})

describe('getMessage', () => {
  test('Error', () => {
    expect(getMessage(new Error('test'))).toBe('test')
  })

  test('nullish', () => {
    expect(getMessage(undefined)).toBe('BadError: undefined')
    expect(getMessage(null)).toBe('BadError: null')
  })

  test('string', () => {
    expect(getMessage('test')).toBe('test')
  })

  test('number', () => {
    expect(getMessage(88)).toBe('88')
  })

  test('Date', () => {
    expect(getMessage(new Date())).toBe('BadError: [object Date]')
  })

  test('{ message: number }', () => {
    expect(getMessage({ message: 'test' })).toBe('test')
  })

  test('{ message: string }', () => {
    expect(getMessage({ message: 88 })).toBe('88')
  })
})

test('toError', () => {
  const error = new Error('test')
  expect(toError('test')).toStrictEqual(error)
  expect(toError(error)).toBe(error)

  const typeError = new TypeError('test')
  expect(toError(typeError)).toBe(typeError)
})

test('raiseError', () => {
  expect(() => raiseError(() => new ReferenceError('test'))).toThrowError(new ReferenceError('test'))
  expect(() => raiseError(() => new TypeError('test'))).toThrowError(new TypeError('test'))
})

test('warnPromiseFailures', async () => {
  const c = mock.console()

  warnPromiseFailures(
    'test',
    await Promise.allSettled([Promise.reject(new TypeError('test')), Promise.reject(new TypeError('test'))])
  )

  expect(c.warn).toHaveBeenNthCalledWith(1, 'test', new TypeError('test'))
  expect(c.warn).toHaveBeenNthCalledWith(2, 'test', new TypeError('test'))

  vi.restoreAllMocks()
})

test('logPromiseFailures', async () => {
  const c = mock.console()

  logPromiseFailures(
    'test',
    await Promise.allSettled([Promise.reject(new TypeError('test')), Promise.reject(new TypeError('test'))])
  )

  expect(c.error).toHaveBeenNthCalledWith(1, 'test', new TypeError('test'))
  expect(c.error).toHaveBeenNthCalledWith(2, 'test', new TypeError('test'))

  vi.restoreAllMocks()
})
