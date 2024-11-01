import { tryOnScopeDispose } from '@vueuse/core'
import { map } from 'radash'
import { computed, readonly, ref, unref, watch } from 'vue'
import type { MaybeRef } from '@vueuse/core'
import { Attachment } from '@/attachments'
import { isNotNullish } from '@/basics'

/* eslint-disable n/no-unsupported-features/node-builtins -- In browser environment. */

export function toFile(attachment: Attachment) {
  return new File([attachment], attachment.name, { type: attachment.type })
}

export function toFiles(attachments?: Attachment[] | null) {
  if (attachments == null) {
    return []
  }

  return attachments.map(toFile).filter(isNotNullish)
}

export async function fileToAttachment(file: File) {
  return new Attachment(file.name, file.type, await file.arrayBuffer())
}

export async function filesToAttachment(files: File[]) {
  return await map(files, fileToAttachment)
}

export function useImages() {
  const images = ref<(string | undefined)[]>([])

  const unloadImages = () => {
    for (const image of images.value) {
      if (image != null) {
        URL.revokeObjectURL(image)
      }
    }
  }

  function loadImages(files: (File | undefined)[]) {
    unloadImages()
    images.value = files.map((file) => (file != null ? URL.createObjectURL(file) : undefined))
  }

  tryOnScopeDispose(unloadImages)

  return { images, loadImages }
}

export function useObjectUrls(sources: MaybeRef<(Blob | MediaSource | undefined)[]>) {
  const urls = ref<(string | undefined)[]>([])
  function release() {
    for (const url of urls.value) {
      if (url != null) {
        URL.revokeObjectURL(url)
      }
    }

    urls.value = []
  }

  watch(
    () => unref(sources),
    function handleSourceChange(files) {
      release()
      for (const file of files) {
        urls.value.push(file != null ? URL.createObjectURL(file) : undefined)
      }
    },
    { immediate: true, deep: true }
  )

  tryOnScopeDispose(release)

  return computed(() => readonly(urls.value))
}
