import { describe, expect, test } from 'vitest'

//
// # Tests the test library a little.
//

describe('reactor', () => {
  test('notImplemented', async () => {
    const { notImplemented } = await import('./support/reactor.js')
    const unneeded = notImplemented<() => unknown>()
    expect(() => unneeded()).toThrowError(Error)
  })
})
