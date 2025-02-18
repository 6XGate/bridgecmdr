<script setup lang="ts">
import { mdiFileImagePlus, mdiVideoInputHdmi } from '@mdi/js'
import videoInputHdmiIcon from '@mdi/svg/svg/video-input-hdmi.svg'
import { useObjectUrl } from '@vueuse/core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { openFile } from '../support/files'

const props = defineProps<{
  image?: File | undefined
}>()

const emit = defineEmits<{
  (on: 'update', file: File): void
  (on: 'change', file: File): void
}>()

const { t } = useI18n()

const file = computed(() => props.image)
const url = useObjectUrl(file)

async function selectImage() {
  const results = await openFile({ accepts: 'image/*' })

  const newFile = results?.at(0) ?? null
  if (newFile != null) {
    emit('update', newFile)
    emit('change', newFile)
  }
}
</script>

<template>
  <VHover v-slot="{ isHovering, props: hover }">
    <VAvatar
      id="replaceableImage"
      size="128"
      v-bind="{ ...hover }"
      color="surface-lighten-1"
      rounded="lg"
      tile
      @click="selectImage">
      <VImg v-if="url != null" width="128" :src="url" :lazy-src="videoInputHdmiIcon" :cover="false" />
      <VIcon v-else :icon="mdiVideoInputHdmi" />
      <VOverlay
        class="align-center justify-center text-center"
        :model-value="isHovering ?? false"
        theme="light"
        scrim="primary-darken-4"
        contained>
        <VIcon :icon="mdiFileImagePlus" />
        <div>{{ t('action.select') }}</div>
      </VOverlay>
    </VAvatar>
  </VHover>
</template>

<style lang="scss" scoped>
#replaceableImage {
  cursor: pointer;
}
</style>

<i18n lang="yaml">
en:
  action:
    select: Select new image
  label:
    select: Select image
  filter:
    all: Support images
    svg: SVG images
    png: PNG images
    gif: GIF images
    jpg: JPEG Images
</i18n>
