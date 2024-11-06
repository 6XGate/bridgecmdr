import { tryOnScopeDispose } from '@vueuse/core'
import { computed, readonly, ref, toValue, unref, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

/* eslint-disable n/no-unsupported-features/node-builtins -- In browser environment. */

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

export function useObjectUrls(sources: MaybeRefOrGetter<(Blob | MediaSource | undefined)[]>) {
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
      for (const file of toValue(files)) {
        urls.value.push(file != null ? URL.createObjectURL(file) : undefined)
      }
    },
    { immediate: true, deep: true }
  )

  tryOnScopeDispose(release)

  return computed(() => readonly(urls.value))
}
