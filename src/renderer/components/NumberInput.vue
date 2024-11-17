<script lang="ts" setup>
import { mdiMinus, mdiPlus } from '@mdi/js'
import { readonly, ref, watch } from 'vue'

interface Props {
  //
  // VTextField properties
  //
  label?: string | undefined
  placeholder?: string | undefined
  //
  // Basic properties
  //
  modelValue?: number | undefined
  min?: number | undefined
  max?: number | undefined
  //
  // Validation
  //
  errorMessages?: string | string[] | undefined
}

const props = withDefaults(defineProps<Props>(), {
  errorMessages: () => new Array<string>()
})

const emit = defineEmits<{
  (on: 'keydown', event: KeyboardEvent): void
  (on: 'update:modelValue', value: number | undefined): void
  (on: 'click:append', value: number | undefined): void
  (on: 'click:prepend', value: number | undefined): void
}>()

defineOptions({
  inheritAttrs: false
})

const kKeyUps = ['ArrowUp'] //, 'Numpad8']
const kKeyDowns = ['ArrowDown'] //, 'Numpad2']

const icons = readonly({ mdiPlus, mdiMinus })

// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- Watched and updated.
const innerModelValue = ref(props.modelValue)
watch(
  () => props.modelValue,
  () => {
    if (innerModelValue.value !== props.modelValue) {
      innerModelValue.value = props.modelValue
    }
  }
)

const updateModel = (value: number | undefined) => {
  if (value != null && props.max != null && value > props.max) {
    value = props.max
  }

  if (value != null && props.min != null && value < props.min) {
    value = props.min
  }

  innerModelValue.value = value
  emit('update:modelValue', value)
}

const parseToModel = (value: string | undefined) => {
  const asNumber = value != null ? Number.parseInt(value, 10) : undefined
  updateModel(!Number.isNaN(asNumber) ? asNumber : undefined)
}

const decrement = (emitClick = false) => {
  const model = innerModelValue.value ?? 1
  const value = model >= (props.min ?? -Infinity) ? model - 1 : model
  updateModel(value)

  if (emitClick) {
    // eslint-disable-next-line vue/custom-event-name-casing -- No... it can not... actually is already is.
    emit('click:prepend', value)
  }
}

const increment = (emitClick = false) => {
  const model = innerModelValue.value ?? -1
  const value = model <= (props.max ?? Infinity) ? model + 1 : model
  updateModel(value)

  if (emitClick) {
    // eslint-disable-next-line vue/custom-event-name-casing -- No... it can not... actually is already is.
    emit('click:append', value)
  }
}

const processKeyDown = (event: KeyboardEvent) => {
  if (innerModelValue.value == null) {
    return
  }

  let prevent = false

  if (props.max != null && innerModelValue.value >= props.max && kKeyUps.includes(event.code)) {
    event.preventDefault()
    prevent = true
  }

  if (props.min != null && innerModelValue.value <= props.min && kKeyDowns.includes(event.code)) {
    event.preventDefault()
    prevent = true
  }

  if (!prevent) {
    emit('keydown', event)
  }
}
</script>

<template>
  <VTextField
    v-bind="$attrs"
    :model-value="innerModelValue"
    :error-messages="errorMessages ?? null"
    :label="label"
    :placeholder="placeholder"
    :step="1"
    @keydown="processKeyDown"
    @update:model-value="parseToModel">
    <template #append>
      <VBtnGroup class="mt-n3" :rounded="false" divided>
        <VBtn
          :icon="icons.mdiPlus"
          @click="
            () => {
              increment(true)
            }
          " />
        <VBtn
          :icon="icons.mdiMinus"
          @click="
            () => {
              decrement(true)
            }
          " />
      </VBtnGroup>
    </template>
  </VTextField>
</template>

<style lang="scss">
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
