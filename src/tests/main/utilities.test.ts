import { beforeEach, expect, test, vi } from 'vitest'
import type { Mock } from 'vitest'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let errorSpy: Mock<(...args: any[]) => any>
beforeEach(() => {
  vi.mock('electron-log', () => {
    errorSpy = vi.fn().mockReturnValue(undefined)

    return {
      default: {
        error: errorSpy
      }
    }
  })
})

test('logError', async () => {
  const { logError } = await import('../../main/utilities')
  const error = new TypeError('Hello')
  logError(error)
  expect(errorSpy).toHaveBeenCalledWith(error)
})
