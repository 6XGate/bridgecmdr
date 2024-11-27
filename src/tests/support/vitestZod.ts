import { expect } from 'vitest'
import type { z } from 'zod'
import { getZodMessage } from '@/error-handling'

export default function useZod() {
  expect.extend({
    toMatchSchema(received: unknown, expected: z.ZodTypeAny) {
      const { isNot, utils } = this

      const result = expected.safeParse(received)
      const message = result.success ? '' : `; did not because ${getZodMessage(result.error)}`
      return {
        pass: result.success,
        message: () =>
          isNot
            ? `${utils.stringify(received)} should not follow the schema`
            : `${utils.stringify(received)} should follow the schema${message}`,
        actual: received
      }
    }
  })
}

interface ZodMatcher<R = unknown> {
  toMatchSchema: <Schema extends z.ZodTypeAny>(schema: Schema) => R
}

declare module 'vitest' {
  /* eslint-disable @typescript-eslint/no-empty-object-type */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends ZodMatcher<T> {}
  interface AsymmetricMatchersContaining extends ZodMatcher {}
  /* eslint-enable @typescript-eslint/no-empty-object-type */
}
