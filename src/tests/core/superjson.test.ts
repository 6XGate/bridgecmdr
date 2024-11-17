import { beforeAll, describe, expect, test } from 'vitest'
import type { SuperJSONResult } from 'superjson'
import { Attachment } from '@/attachments'
import useSuperJson from '@/rpc/transformer'

describe('superjson', () => {
  let superjson: ReturnType<typeof useSuperJson>
  beforeAll(() => {
    superjson = useSuperJson()
  })

  describe('attachments', () => {
    test('serialize', () => {
      const payload = { file: new Attachment('test.txt', 'text/plain', Buffer.from('Hello World')) }
      expect(superjson.serialize(payload)).toStrictEqual({
        json: { file: { name: 'test.txt', type: 'text/plain', data: 'SGVsbG8gV29ybGQ=' } },
        meta: { values: { file: [['custom', 'Attachment']] } }
      })
    })

    test('deserialize', () => {
      const payload = {
        json: { file: { name: 'test.txt', type: 'text/plain', data: 'SGVsbG8gV29ybGQ=' } },
        meta: { values: { file: [['custom', 'Attachment']] } }
      } satisfies SuperJSONResult
      expect(superjson.deserialize(payload)).toStrictEqual({
        file: new Attachment('test.txt', 'text/plain', Buffer.from('Hello World'))
      })
    })
  })

  describe('functions', () => {
    test('serialize', () => {
      const payload = { hello: () => undefined }
      expect(() => superjson.serialize(payload)).toThrow(new TypeError('Functions may not be serialized'))
    })

    test('deserialize', () => {
      const payload = {
        json: { file: null },
        meta: { values: { file: [['custom', 'Function']] } }
      } satisfies SuperJSONResult
      expect(() => superjson.deserialize(payload)).toThrow(new TypeError('Functions may not be serialized'))
    })
  })
})
