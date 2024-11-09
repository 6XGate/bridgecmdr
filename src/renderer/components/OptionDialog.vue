<script setup lang="ts">
import is from '@sindresorhus/is'
import { useVModel } from '@vueuse/core'
import { get } from 'radash'
import { watch, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useElementScrollingBounds } from '../hooks/element'
import type { Anchor, Origin, SelectItemKey } from '../hooks/vuetify'
import type { I18nSchema } from '../locales/locales'
import type { ComponentPublicInstance } from 'vue'
import { toArray } from '@/basics'

interface Props {
  // Activator attachment
  activator?: string | Element | ComponentPublicInstance | undefined
  activatorProps?: object | undefined
  attach?: string | boolean | Element | undefined
  // State
  // eslint-disable-next-line vue/no-unused-properties -- useVModel
  visible?: boolean
  disabled?: boolean
  persistent?: boolean
  scrollable?: boolean
  // Size and location
  absolute?: boolean
  fullscreen?: boolean
  location?: Anchor | undefined
  origin?: Origin | undefined
  height?: string | number | undefined
  width?: string | number | undefined
  minHeight?: string | number | undefined
  minWidth?: string | number | undefined
  maxHeight?: string | number | undefined
  maxWidth?: string | number | undefined
  zIndex?: string | number | undefined
  // Popup data
  title: string
  confirmButton?: string | undefined
  cancelButton?: string | undefined
  withCancel?: boolean
  modelValue?: unknown
  items: unknown[]
  itemTitle?: SelectItemKey | undefined
  itemType?: SelectItemKey | undefined
  itemValue?: SelectItemKey | undefined
  itemProps?: SelectItemKey | undefined
  mandatory?: boolean
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemTitle: 'title',
  itemType: 'type',
  itemValue: 'value',
  itemProps: 'props'
})

const emit = defineEmits<{
  (on: 'update:modelValue', value: unknown): void
  (on: 'update:visible', value: boolean): void
}>()

const { t } = useI18n<I18nSchema>()

const confirmLabel = computed(() => props.confirmButton ?? t('common.confirm'))
const showCancel = computed(() => props.persistent || props.withCancel)
const cancelLabel = computed(() => props.cancelButton ?? t('common.cancel'))

const isVisible = useVModel(props, 'visible', emit, { passive: true, defaultValue: false })

// HACK: Always use cancelChanges since updateValue will dismiss the dialog after updating the original.
watch(isVisible, (value) => {
  if (!value) cancelChange()
})

// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- Watched and update.
const innerValue = ref(props.multiple ? toArray(props.modelValue) : props.modelValue)
const originalValue = ref(innerValue.value)
watch(
  () => props.modelValue,
  (value) => {
    innerValue.value = props.multiple ? toArray(value) : value
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
    scrollable,
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
    scrollable,
    zIndex
  }
})

// FIXME: Needs to say it extends VListItem props.
const getFromItem =
  <T = unknown,>(source: () => SelectItemKey, def: string) =>
  (): ((item: unknown) => T | undefined) => {
    const selector = source()
    if (selector === false) {
      return () => undefined
    }

    if (typeof selector === 'string') {
      return (item) => get(item, selector)
    }

    if (Array.isArray(selector)) {
      const path = selector
        .map((key, index) => (typeof key === 'string' ? `${index === 0 ? '' : '.'}${key}` : `[${key}]`))
        .join('')

      return (item) => get(item, path)
    }

    if (typeof selector === 'function') {
      return (item) => selector(item as Record<string, unknown>) as T
    }

    return (item) => get(item, def)
  }

const getItemTitle = computed(getFromItem<string>(() => props.itemTitle, 'title'))
const getItemType = computed(getFromItem<string>(() => props.itemType, 'type'))
const getItemValue = computed(getFromItem(() => props.itemValue, 'value'))
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Due to issues with Vue and exactOptionalPropertyTypes.
const getItemProps = computed(getFromItem<any>(() => props.itemProps, 'props'))

const body = ref<ComponentPublicInstance | null>(null)
const scrolling = useElementScrollingBounds(body)
const showDividers = computed(() => scrolling.value.client.height !== scrolling.value.scrolling.height)
</script>

<template>
  <VDialog v-model="isVisible" v-bind="dialogProps" scrollable>
    <template #activator="scope"><slot name="activator" v-bind="scope"></slot></template>
    <VCard>
      <VCardTitle v-if="is.nonEmptyString(title)" class="text-subtitle-1">{{ title }}</VCardTitle>
      <VDivider v-if="showDividers" />
      <VCardText ref="body">
        <template v-if="multiple">
          <template v-for="(item, index) of items">
            <template v-if="getItemType(item) === 'divider'">
              <VDivider :key="`option-${index}`" />
            </template>
            <template v-else>
              <VCheckbox
                :key="`option-${index}`"
                v-model="innerValue"
                v-bind="getItemProps(item)"
                :label="getItemTitle(item)"
                :value="getItemValue(item)" />
            </template>
          </template>
        </template>
        <template v-else>
          <VRadioGroup v-model="innerValue" :mandantory="mandatory" @update:model-value="updateValue">
            <template v-for="(item, index) of items">
              <template v-if="getItemType(item) === 'divider'">
                <VDivider :key="`option-${index}`" />
              </template>
              <template v-else>
                <VRadio
                  :key="`option-${index}`"
                  v-bind="getItemProps(item)"
                  :label="getItemTitle(item)"
                  :value="getItemValue(item)" />
              </template>
            </template>
          </VRadioGroup>
        </template>
      </VCardText>
      <VDivider v-if="showDividers" />
      <VCardActions v-if="showCancel || multiple">
        <VSpacer />
        <VBtn v-if="showCancel" class="text-none" @click="cancelChange">{{ cancelLabel }}</VBtn>
        <VBtn v-if="multiple" class="text-none" color="primary" @click="updateValue">{{ confirmLabel }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
