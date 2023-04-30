<script setup lang="ts">
import { get } from 'radash'
import { computed, ref, watch, unref } from 'vue'
import type { Anchor, Origin, SelectItemKey } from '@/helpers/vuetify'
import type { ComponentPublicInstance, PropType } from 'vue'

const props = defineProps({
  // Activator attachment
  activator: [String, Object] as PropType<string | Element | ComponentPublicInstance>,
  activatorProps: Object,
  attach: [String, Boolean, Element] as PropType<string | boolean | Element>,
  // State
  disabled: Boolean,
  // Size and location
  location: String as PropType<Anchor>,
  origin: String as PropType<Origin>,
  height: [String, Number],
  width: [String, Number],
  minHeight: [String, Number],
  minWidth: [String, Number],
  maxHeight: [String, Number],
  maxWidth: [String, Number],
  zIndex: [String, Number],
  // Menu data
  // eslint-disable-next-line vue/require-prop-types -- Could be any type and useVModel.
  modelValue: { },
  items: { type: Array, required: true },
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

const innerValue = ref(props.modelValue)
watch(() => props.modelValue, value => { innerValue.value = value })
watch(innerValue, value => { value !== props.modelValue && emit('update:modelValue', value) })

const visible = ref(false)
watch(visible, value => { emit('update:visible', value) })

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

const getFromItem = <T> (selector: SelectItemKey, def: string) =>
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
const getItemProps = computed(getFromItem<unknown>(props.itemProps, 'props'))

</script>

<template>
  <VMenu v-bind="menuProps">
    <template #activator="scope"><slot name="activator" v-bind="scope"></slot></template>
    <VList>
      <VItemGroup v-model="innerValue" :mandatory="mandatory" :multiple="multiple">
        <template v-for="item of items" :key="getItemValue(item)">
          <VListSubheader v-if="getItemType(item) === 'subheader'">{{ getItemTitle(item) }}</VListSubheader>
          <VDivider v-if="getItemType(item) === 'divider'"/>
          <VItem v-slot="{ isSelected, toggle }" :value="getItemValue(item)">
            <VListItem :title="getItemTitle(item)" v-bind="getItemProps(item)"
                       :active="unref(isSelected)" @click="toggle"/>
          </VItem>
        </template>
      </VItemGroup>
    </VList>
  </VMenu>
</template>
