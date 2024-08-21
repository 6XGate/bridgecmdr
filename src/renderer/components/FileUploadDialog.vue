<script setup lang="ts">
import { mdiFile } from '@mdi/js'
import fileIcon from '@mdi/svg/svg/file.svg'
import is from '@sindresorhus/is'
import { useObjectUrl, useVModel } from '@vueuse/core'
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useElementScrollingBounds } from '../helpers/element'
import { useButton } from '../helpers/utilities'
import type { I18nSchema } from '../locales/locales'
import type { ComponentPublicInstance } from 'vue'
import { toArray } from '@/basics'

interface Props {
  // State
  // eslint-disable-next-line vue/no-unused-properties -- useVModel
  visible?: boolean
  // Size and location
  // File
  accept?: string | undefined
  icon?: string | undefined
  unsetIcon?: string | undefined
  lazySource?: string | undefined
  // Popup data
  title?: string | undefined
  showConfirm?: boolean | string | undefined
  showCancel?: boolean | string | undefined
  modelValue?: File | undefined
  mandatory?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  unsetIcon: mdiFile,
  lazySource: fileIcon,
  showConfirm: false,
  showCancel: false
})

const emit = defineEmits<{
  (on: 'update:model-value' | 'confirm', value: File | undefined): void
  (on: 'update:visible', value: boolean): void
}>()

const { t } = useI18n<I18nSchema>()

const confirmButton = useButton(
  () => props.showConfirm,
  () => t('common.confirm')
)
const cancelButton = useButton(
  () => props.showCancel,
  () => t('common.cancel')
)

const isVisible = useVModel(props, 'visible', emit)

// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- Watched and updated
const innerValue = ref(props.modelValue != null ? [props.modelValue] : [])
watch(
  () => props.modelValue,
  (value) => {
    innerValue.value = value != null ? [value] : []
  }
)

const current = computed(() => innerValue.value[0])
const image = useObjectUrl(current)

const onNewFile = async (files: File | File[]) => {
  files = toArray(files)
  // Confirm the dialog if the confirm button is not present.
  if (confirmButton.value == null && is.nonEmptyArray(files)) {
    await nextTick()
    updateValue()
  }
}

const updateValue = () => {
  emit('update:model-value', current.value)
  emit('confirm', current.value)
  isVisible.value = false
}

const cancelChange = () => {
  isVisible.value = false
}

const disableConfirm = computed(() => props.mandatory && !is.nonEmptyArray(innerValue.value))

const body = ref<ComponentPublicInstance | null>(null)
const scrolling = useElementScrollingBounds(body)
const showDividers = computed(() => scrolling.value.client.height !== scrolling.value.scrolling.height)
</script>

<template>
  <VCard>
    <VCardText ref="body">
      <div v-if="is.nonEmptyString(title)">{{ title }}</div>
      <VFileInput
        v-model="innerValue"
        :accept="accept"
        prepend-icon=""
        :prepend-inner-icon="icon"
        variant="outlined"
        density="compact"
        @update:model-value="onNewFile" />
      <div class="d-flex justify-center">
        <VCard
          variant="outlined"
          width="128"
          height="128"
          rounded="lg"
          class="align-content-center bg-surface-lighten-1">
          <VIcon v-if="image == null" size="128" :icon="unsetIcon" :cover="false" />
          <VImg v-else width="128" max-height="128" :aspect-ratio="1" :src="image" :lazy-src="lazySource" />
        </VCard>
      </div>
    </VCardText>
    <VDivider v-if="showDividers" />
    <VCardActions>
      <VSpacer />
      <VBtn v-if="cancelButton != null" class="text-none" @click="cancelChange">
        {{ cancelButton }}
      </VBtn>
      <VBtn
        v-if="confirmButton != null"
        :disabled="disableConfirm"
        class="text-none"
        color="primary"
        @click="updateValue">
        {{ confirmButton }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>
