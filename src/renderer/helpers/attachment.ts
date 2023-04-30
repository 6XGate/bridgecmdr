import { tryOnScopeDispose } from '@vueuse/core'
import { computed, readonly, ref, unref, watch } from 'vue'
import { isNotNullish } from '@/helpers/filters'
import type { Attachment, Attachments } from '@/data/database'
import type { MaybeRef } from '@vueuse/core'

export const toFile = (id: string, attachment: Attachment) => {
  if (!('data' in attachment)) {
    return undefined
  }

  return new File([attachment.data], id, { type: attachment.content_type })
}

export const toFiles = (attachments?: Attachments) => {
  if (attachments == null) {
    return []
  }

  return Object.entries(attachments)
    .map(entry => toFile(...entry))
    .filter(isNotNullish)
}

export const useImages = () => {
  const images = ref<Array<string | undefined>>([])

  const unloadImages = () => {
    images.value.forEach(image => {
      if (image != null) {
        URL.revokeObjectURL(image)
      }
    })
  }

  const loadImages = (files: Array<File | undefined>) => {
    unloadImages()
    images.value = files.map(file => (file != null
      ? URL.createObjectURL(file)
      : undefined))
  }

  tryOnScopeDispose(unloadImages)

  return { images, loadImages }
}

export const useObjectUrls = (sources: MaybeRef<Array<Blob | MediaSource | undefined>>) => {
  const urls = ref<Array<string | undefined>>([])
  const release = () => {
    for (const url of urls.value) {
      if (url != null) {
        URL.revokeObjectURL(url)
      }
    }

    urls.value = []
  }

  watch(() => unref(sources), files => {
    release()
    for (const file of files) {
      urls.value.push(file != null ? URL.createObjectURL(file) : undefined)
    }
  }, { immediate: true, deep: true })

  tryOnScopeDispose(release)

  return computed(() => readonly(urls.value))
}
