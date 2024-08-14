<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { get } from 'radash'
import { computed, ref, watch, unref } from 'vue'
import type { Anchor, Origin, SelectItemKey } from '../helpers/vuetify'
import type { ComponentPublicInstance } from 'vue'
import type { VListItem } from 'vuetify/components'

interface Props {
  // Activator attachment
  activator?: string | Element | ComponentPublicInstance | undefined
  activatorProps?: object | undefined
  attach?: string | boolean | Element | undefined
  // State
  disabled?: boolean
  // Size and location
  location?: Anchor | undefined
  origin?: Origin | undefined
  height?: string | number | undefined
  width?: string | number | undefined
  minHeight?: string | number | undefined
  minWidth?: string | number | undefined
  maxHeight?: string | number | undefined
  maxWidth?: string | number | undefined
  zIndex?: string | number | undefined
  // Menu data
  // eslint-disable-next-line vue/no-unused-properties -- useVModel
  modelValue?: unknown
  items: unknown[]
  itemTitle?: SelectItemKey | undefined
  itemType?: SelectItemKey | undefined
  itemValue?: SelectItemKey | undefined
  itemProps?: SelectItemKey | undefined
  mandatory: boolean
  multiple: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemTitle: 'title',
  itemType: 'type',
  itemValue: 'value',
  itemProps: 'props'
})

// const props = defineProps({
//   // Activator attachment
//   activator: [String, Object] as PropType<string | Element | ComponentPublicInstance>,
//   activatorProps: Object,
//   attach: [String, Boolean, Element] as PropType<string | boolean | Element>,
//   // State
//   disabled: Boolean,
//   // Size and location
//   location: String as PropType<Anchor>,
//   origin: String as PropType<Origin>,
//   height: [String, Number],
//   width: [String, Number],
//   minHeight: [String, Number],
//   minWidth: [String, Number],
//   maxHeight: [String, Number],
//   maxWidth: [String, Number],
//   zIndex: [String, Number],
//   // Menu data
//   // eslint-disable-next-line vue/require-prop-types -- Could be any type and useVModel.
//   modelValue: {},
//   items: { type: Array, required: true },
//   itemTitle: { type: [Boolean, String, Array, Function] as PropType<SelectItemKey>, default: 'title' },
//   itemType: { type: [Boolean, String, Array, Function] as PropType<SelectItemKey>, default: 'type' },
//   itemValue: { type: [Boolean, String, Array, Function] as PropType<SelectItemKey>, default: 'value' },
//   itemProps: { type: [Boolean, String, Array, Function] as PropType<SelectItemKey>, default: 'props' },
//   mandatory: Boolean,
//   multiple: Boolean
// })

const emit = defineEmits<{
  (on: 'update:modelValue', value: unknown): void
  (on: 'update:visible', value: boolean): void
}>()

const innerValue = useVModel(props, 'modelValue', emit)
// watch(
//   () => props.modelValue,
//   value => {
//     innerValue.value = value
//   }
// )
// watch(innerValue, value => {
//   if (value !== props.modelValue) emit('update:modelValue', value)
// })

const visible = ref(false)
watch(visible, (value) => {
  emit('update:visible', value)
})

const menuProps = computed((): Record<string, unknown> => {
  const {
    activator,
    activatorProps,
    attach,
    disabled,
    location,
    origin,
    height,
    width,
    minHeight,
    minWidth,
    maxHeight,
    maxWidth,
    zIndex
  } = props

  return {
    activator,
    activatorProps,
    attach,
    disabled,
    location,
    origin,
    height,
    width,
    minHeight,
    minWidth,
    maxHeight,
    maxWidth,
    zIndex
  }
})

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
</script>

<template>
  <VMenu v-bind="menuProps">
    <template #activator="scope"><slot name="activator" v-bind="scope"></slot></template>
    <VList>
      <VItemGroup v-model="innerValue" :mandatory="mandatory" :multiple="multiple">
        <template v-for="item of items" :key="getItemValue(item)">
          <VListSubheader v-if="getItemType(item) === 'subheader'">{{ getItemTitle(item) }}</VListSubheader>
          <VDivider v-if="getItemType(item) === 'divider'" />
          <VItem v-slot="{ isSelected, toggle }" :value="getItemValue(item)">
            <VListItem
              :title="getItemTitle(item)"
              v-bind="getItemProps(item)"
              :active="unref(isSelected)"
              @click="toggle" />
          </VItem>
        </template>
      </VItemGroup>
    </VList>
  </VMenu>
</template>
