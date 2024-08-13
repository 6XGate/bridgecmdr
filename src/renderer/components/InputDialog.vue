<script setup lang="ts">
import is from '@sindresorhus/is'
import { useVModel } from '@vueuse/core'
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Anchor, Origin } from '../helpers/vuetify'
import type { I18nSchema } from '../locales/locales'
import type { ComponentPublicInstance } from 'vue'

interface Props {
  // Activator attachment
  activator?: string | Element | ComponentPublicInstance | undefined
  activatorProps?: object | undefined
  attach?: string | boolean | Element | undefined
  // State
  // eslint-disable-next-line vue/no-unused-properties -- useVModel
  visible?: boolean
  persistent?: boolean
  disabled?: boolean
  // Size and location
  absolute?: boolean
  fullscreen?: boolean
  location?: Anchor | undefined
  origin?: Origin | undefined
  height?: number | string | undefined
  width?: number | string | undefined
  minHeight?: number | string | undefined
  minWidth?: number | string | undefined
  maxHeight?: number | string | undefined
  maxWidth?: number | string | undefined
  zIndex?: number | string | undefined
  // Popup data
  title?: string | undefined
  confirmButton?: string | undefined
  cancelButton?: string | undefined
  withCancel?: boolean
  modelValue?: string | undefined
  mandatory?: boolean
}

const props = defineProps<Props>()

// const props = defineProps({
//   // Activator attachment
//   activator: [String, Object] as PropType<string | Element | ComponentPublicInstance>,
//   activatorProps: Object,
//   attach: [String, Boolean, Element] as PropType<string | boolean | Element>,
//   // State
//   visible: Boolean,
//   persistent: Boolean,
//   disabled: Boolean,
//   // Size and location
//   absolute: Boolean,
//   fullscreen: Boolean,
//   location: String as PropType<Anchor>,
//   origin: String as PropType<Origin>,
//   height: [String, Number],
//   width: [String, Number],
//   minHeight: [String, Number],
//   minWidth: [String, Number],
//   maxHeight: [String, Number],
//   maxWidth: [String, Number],
//   zIndex: [String, Number],
//   // Popup data
//   title: String,
//   confirmButton: String,
//   cancelButton: String,
//   withCancel: Boolean,
//   modelValue: String,
//   mandatory: Boolean
// })

const emit = defineEmits<{
  (on: 'update:modelValue', value: string | undefined): void
  (on: 'update:visible', value: boolean): void
}>()

const { t } = useI18n<I18nSchema>()

const confirmLabel = computed(() => props.confirmButton ?? t('common.confirm'))
const cancelLabel = computed(() => props.cancelButton ?? t('common.cancel'))

const isVisible = useVModel(props, 'visible')

// HACK: Always use cancelChanges since updateValue will dismiss the dialog after updating the original.
watch(isVisible, value => {
  if (!value) cancelChange()
})

// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- Watched and updated.
const innerValue = ref(props.modelValue)
const originalValue = ref(innerValue.value)
watch(
  () => props.modelValue,
  value => {
    innerValue.value = value
    originalValue.value = innerValue.value
  }
)

const updateValue = () => {
  originalValue.value = innerValue.value
  emit('update:modelValue', innerValue.value)
  if (isVisible.value) {
    isVisible.value = false
  }
}

const cancelChange = () => {
  innerValue.value = originalValue.value
  if (isVisible.value) {
    isVisible.value = false
  }
}

const dialogProps = computed((): Record<string, unknown> => {
  const {
    absolute,
    activator,
    activatorProps,
    attach,
    disabled,
    fullscreen,
    location,
    origin,
    height,
    width,
    minHeight,
    minWidth,
    maxHeight,
    maxWidth,
    persistent,
    zIndex
  } = props

  return {
    absolute,
    activator,
    activatorProps,
    attach,
    disabled,
    fullscreen,
    location,
    origin,
    height,
    width,
    minHeight,
    minWidth,
    maxHeight,
    maxWidth,
    persistent,
    zIndex
  }
})

const showCancel = computed(() => props.persistent || props.withCancel)
const disableConfirm = computed(() => props.mandatory && !is.nonEmptyString(innerValue.value))
</script>

<template>
  <VDialog v-model="isVisible" v-bind="dialogProps">
    <template #activator="scope"><slot name="activator" v-bind="scope"></slot></template>
    <VCard>
      <VCardText>
        <div v-if="is.nonEmptyString(title)">{{ title }}</div>
        <VTextField v-model="innerValue" variant="underlined" single-line />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn v-if="showCancel" class="text-none" @click="cancelChange">
          {{ cancelLabel }}
        </VBtn>
        <VBtn :disabled="disableConfirm" class="text-none" color="primary" @click="updateValue">
          {{ confirmLabel }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
