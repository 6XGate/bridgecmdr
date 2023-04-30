<script setup lang="ts">
import is from '@sindresorhus/is'
import { get } from 'radash'
import { watch, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useElementScrollingBounds } from '@/helpers/element'
import { toArray } from '@/helpers/type'
import type { Anchor, Origin, SelectItemKey } from '@/helpers/vuetify'
import type { I18nSchema } from '@/locales/locales'
import type { ComponentPublicInstance, PropType } from 'vue'

const props = defineProps({
  // Activator attachment
  activator: [String, Object] as PropType<string | Element | ComponentPublicInstance>,
  activatorProps: Object,
  attach: [String, Boolean, Element] as PropType<string | boolean | Element>,
  // State
  disabled: Boolean,
  persistent: Boolean,
  scrollable: Boolean,
  visible: Boolean,
  // Size and location
  absolute: Boolean,
  fullscreen: Boolean,
  location: String as PropType<Anchor>,
  origin: String as PropType<Origin>,
  height: [String, Number],
  width: [String, Number],
  minHeight: [String, Number],
  minWidth: [String, Number],
  maxHeight: [String, Number],
  maxWidth: [String, Number],
  zIndex: [String, Number],
  // Popup data
  title: String,
  confirmButton: String,
  cancelButton: String,
  withCancel: Boolean,
  // eslint-disable-next-line vue/require-prop-types -- Could be any type and useVModel.
  modelValue: { },
  items: { type: Array as PropType<readonly unknown[]>, required: true },
  itemTitle: { type: [Boolean, String, Array, Function] as PropType<SelectItemKey>, default: 'title' },
  itemType: { type: [Boolean, String, Array, Function] as PropType<SelectItemKey>, default: 'type' },
  itemValue: { type: [Boolean, String, Array, Function] as PropType<SelectItemKey>, default: 'value' },
  itemProps: { type: [Boolean, String, Array, Function] as PropType<SelectItemKey>, default: 'props' },
  mandatory: Boolean,
  multiple: Boolean
})

const emit = defineEmits<{
  (on: 'update:modelValue', value: unknown): void
  (on: 'update:visible', value: boolean): void
}>()

const { t } = useI18n<I18nSchema>()

const confirmLabel = computed(() => props.confirmButton ?? t('common.confirm'))
const showCancel = computed(() => props.persistent || props.withCancel)
const cancelLabel = computed(() => props.cancelButton ?? t('common.cancel'))

const isVisible = ref(props.visible)
watch(() => props.visible, value => { isVisible.value = value })
// HACK: Always use cancelChanges since updateValue will dismiss the dialog after updating the original.
watch(isVisible, value => { !value && cancelChange() })
watch(isVisible, value => { value !== props.visible && emit('update:visible', value) })

const innerValue = ref(props.multiple ? toArray(props.modelValue) : props.modelValue)
const originalValue = ref(innerValue.value)
watch(() => props.modelValue, value => {
  innerValue.value = props.multiple ? toArray(value) : value
  originalValue.value = innerValue.value
})

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

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint -- TSX confusion.
const getFromItem = <T extends unknown> (selector: SelectItemKey, def: string) =>
  (): (item: unknown) => T => {
    if (selector === false) {
      return () => undefined as T
    }

    if (typeof selector === 'string') {
      return item => get(item, selector) as T
    }

    if (Array.isArray(selector)) {
      const path = selector.map((key, index) => (typeof key === 'string'
        ? `${index === 0 ? '' : '.'}${key}`
        : `[${key}]`)).join('')

      return item => get(item, path) as T
    }

    if (typeof selector === 'function') {
      return item => selector(item as Record<string, unknown>) as T
    }

    return item => get(item, def) as T
  }

const getItemTitle = computed(getFromItem<string>(props.itemTitle, 'title'))
const getItemType = computed(getFromItem<string>(props.itemType, 'type'))
const getItemValue = computed(getFromItem<unknown>(props.itemValue, 'value'))
const getItemProps = computed(getFromItem<Record<string, unknown>>(props.itemProps, 'props'))

const body = ref<ComponentPublicInstance | null>(null)
const scrolling = useElementScrollingBounds(body)
const showDividers = computed(() => scrolling.value.client.height !== scrolling.value.scrolling.height)
</script>

<template>
  <VDialog v-model="isVisible" v-bind="dialogProps" scrollable>
    <template #activator="scope"><slot name="activator" v-bind="scope"></slot></template>
    <VCard>
      <VCardTitle v-if="is.nonEmptyString(title)" class="text-subtitle-1">{{ title }}</VCardTitle>
      <VDivider v-if="showDividers"/>
      <VCardText ref="body">
        <template v-if="multiple">
          <template v-for="(item, index) of items">
            <template v-if="getItemType(item) === 'divider'">
              <VDivider :key="`option-${index}`"/>
            </template>
            <template v-else>
              <VCheckbox :key="`option-${index}`" v-model="innerValue" v-bind="getItemProps(item)"
                         :label="getItemTitle(item)" :value="getItemValue(item)"/>
            </template>
          </template>
        </template>
        <template v-else>
          <VRadioGroup v-model="innerValue" :mandantory="mandatory" @update:model-value="updateValue">
            <template v-for="(item, index) of items">
              <template v-if="getItemType(item) === 'divider'">
                <VDivider :key="`option-${index}`"/>
              </template>
              <template v-else>
                <VRadio :key="`option-${index}`" v-bind="getItemProps(item)"
                        :label="getItemTitle(item)" :value="getItemValue(item)"/>
              </template>
            </template>
          </VRadioGroup>
        </template>
      </VCardText>
      <VDivider v-if="showDividers"/>
      <VCardActions v-if="showCancel || multiple">
        <VSpacer/>
        <VBtn v-if="showCancel" class="text-none" @click="cancelChange">{{ cancelLabel }}</VBtn>
        <VBtn v-if="multiple" class="text-none" color="primary" @click="updateValue">{{ confirmLabel }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
