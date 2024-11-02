import { defer } from 'radash'
import { Attachment } from '@/attachments'
import { asMicrotask, isNotNullish, withResolvers } from '@/basics'
import { raiseError } from '@/error-handling'

/* eslint-disable n/no-unsupported-features/node-builtins -- In browser environment. */

export async function saveFile(source: File): Promise<void>
export async function saveFile(source: Blob, defaultName: string): Promise<void>
export async function saveFile(source: File | (Blob & { name?: undefined }), defaultName?: string) {
  await defer(async (cleanup) => {
    const saver = globalThis.document.createElement('a')
    saver.style.display = 'none'
    saver.href = URL.createObjectURL(source)
    saver.download = source.name ?? defaultName ?? raiseError(() => new TypeError('No file name specified'))
    cleanup(() => {
      URL.revokeObjectURL(saver.href)
    })

    await asMicrotask(() => {
      globalThis.document.body.appendChild(saver)
      cleanup(() => {
        globalThis.document.body.removeChild(saver)
      })
    })

    await asMicrotask(() => {
      saver.click()
    })
  })
}

interface OpenFileOptions {
  accepts?: string | undefined
  multiple?: true | undefined
}

export async function openFile(options: OpenFileOptions = {}) {
  return await defer(async (cleanup) => {
    const opener = globalThis.document.createElement('input')
    opener.style.display = 'none'
    opener.type = 'file'
    opener.accept = options.accepts ?? ''
    opener.multiple = options.multiple ?? false

    await asMicrotask(() => {
      globalThis.document.body.appendChild(opener)
      cleanup(() => {
        globalThis.document.body.removeChild(opener)
      })
    })

    return await asMicrotask(async () => {
      const { resolve, promise } = withResolvers<File[] | null>()
      opener.addEventListener(
        'cancel',
        () => {
          resolve(null)
        },
        { once: true }
      )
      opener.addEventListener(
        'change',
        () => {
          resolve([...(opener.files ?? [])].filter(isNotNullish))
        },
        { once: true }
      )

      opener.click()

      return await promise
    })
  })
}

type MaybeAttachment = Attachment | null | undefined

export function toFile(attachment: Attachment): File
export function toFile(attachment: MaybeAttachment): File | null
export function toFile(attachment: MaybeAttachment) {
  return attachment != null ? new File([attachment], attachment.name, { type: attachment.type }) : null
}

export function toFiles(attachments: MaybeAttachment[] | null | undefined) {
  if (attachments == null) return []
  return attachments.map(toFile).filter(isNotNullish)
}

type MaybeFile = File | null | undefined

export function toAttachment(file: File): Promise<Attachment>
export function toAttachment(file: MaybeFile): Promise<Attachment | null>
export async function toAttachment(file: MaybeFile) {
  return file != null ? new Attachment(file.name, file.type, await file.arrayBuffer()) : null
}

export async function toAttachments(files: MaybeFile[] | null | undefined) {
  if (files == null) return []
  const attachments = await Promise.all(files.map(toAttachment))
  return attachments.filter(isNotNullish)
}
