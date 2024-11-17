/// <reference types="pouchdb-core" />

import { Buffer } from 'node:buffer'
import { beforeAll, expect, test } from 'vitest'
import { Attachment } from '@/attachments'

let text: string
let data: Uint8Array
let buffer: Buffer
let blob: Blob
let file: File

beforeAll(() => {
  const textEncoder = new TextEncoder()
  text = 'This is a test'
  data = textEncoder.encode(text)
  buffer = Buffer.from(data)
  blob = new Blob([data], { type: 'text/plain' })
  file = new File([data], 'test', { type: 'text/plain' })
})

test('creating an Attachment instance', () => {
  const attachment = new Attachment('test', 'text/plain', data)
  expect(attachment.name).toStrictEqual('test')
  expect(attachment.type).toStrictEqual('text/plain')
  expect(attachment.buffer).toStrictEqual(data.buffer)
})

test('creating an Attachment from a File', async () => {
  const attachment = await Attachment.fromFile(file)
  expect(attachment.name).toStrictEqual('test')
  expect(attachment.type).toStrictEqual('text/plain')
  expect(attachment.buffer).toStrictEqual(data.buffer)
})

test('creating an Attachment from a PouchDB Buffer attachment', async () => {
  const dbAttachment = { content_type: 'text/plain', data: buffer } satisfies PouchDB.Core.FullAttachment
  const attachment = await Attachment.fromPouchAttachment('test', dbAttachment)
  expect(attachment.name).toStrictEqual('test')
  expect(attachment.type).toStrictEqual('text/plain')
  expect(attachment.buffer).toStrictEqual(data.buffer)
})

test('creating an Attachment from a PouchDB Blob attachment', async () => {
  const dbAttachment = { content_type: 'text/plain', data: blob } satisfies PouchDB.Core.FullAttachment
  const attachment = await Attachment.fromPouchAttachment('test', dbAttachment)
  expect(attachment.name).toStrictEqual('test')
  expect(attachment.type).toStrictEqual('text/plain')
  expect(attachment.buffer).toStrictEqual(data.buffer)
})

test('creating an Attachment from a PouchDB text attachment', async () => {
  const dbAttachment = { content_type: 'text/plain', data: text } satisfies PouchDB.Core.FullAttachment
  const attachment = await Attachment.fromPouchAttachment('test', dbAttachment)
  expect(attachment.name).toStrictEqual('test')
  expect(attachment.type).toStrictEqual('text/plain')
  expect(attachment.buffer).toStrictEqual(data.buffer)
})
