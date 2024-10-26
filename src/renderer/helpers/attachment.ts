import { tryOnScopeDispose } from '@vueuse/core'
import { computed, readonly, ref, unref, watch } from 'vue'
import type { Attachment, Attachments } from '../data/database'
import type { MaybeRef } from '@vueuse/core'
import { isNotNullish } from '@/basics'

/* eslint-disable n/no-unsupported-features/node-builtins -- In browser environment. */

export function toFile(id: string, attachment: Attachment) {
  if (!('data' in attachment)) {
    return undefined
  }

  return new File([attachment.data], id, { type: attachment.content_type })
}

export function toFiles(attachments?: Attachments) {
  if (attachments == null) {
    return []
  }

  return Object.entries(attachments)
    .map((entry) => toFile(...entry))
    .filter(isNotNullish)
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
