<script setup lang="ts">
import { mdiClose } from '@mdi/js'
import { useVModel } from '@vueuse/core'
import { computed, ref, reactive, watch, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import NumberInput from '../components/NumberInput.vue'
import { useRules, useValidation } from '../helpers/validation'
import { kDeviceCanDecoupleAudioOutput, kDeviceSupportsMultipleOutputs, useDrivers } from '../system/driver'
import { useSources } from '../system/source'
import { useSwitches } from '../system/switch'
import { useDialogs, useTieDialog } from './dialogs'
import type { I18nSchema } from '../locales/locales'
import type { Source } from '../system/source'
import type { NewTie } from '../system/tie'
import type { DeepReadonly } from 'vue'
import { deepClone } from '@/object'

const props = defineProps<{
  // Dialog
  // eslint-disable-next-line vue/no-unused-properties -- useVModel
  visible?: boolean
  // Form
  editing: boolean
  source?: Source | undefined
  tie: DeepReadonly<NewTie>
}>()

const emit = defineEmits<{
  (on: 'update:visible', value: boolean): void
  (on: 'confirm', value: NewTie): void
}>()

const { t } = useI18n<I18nSchema>()
const dialogs = useDialogs()
const isBusy = computed(() => switches.isBusy || sources.isBusy || drivers.isBusy)

const isVisible = useVModel(props, 'visible', emit)

const title = computed(() => (props.editing ? t('label.addTie') : t('label.editTie')))

const drivers = useDrivers()
onBeforeMount(drivers.all)

const switches = useSwitches()
const sources = useSources()
// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- Prop reactivity not desired.
const target = ref<NewTie>({
  // eslint-disable-next-line vue/no-setup-props-reactivity-loss -- Prop reactivity not desired.
  ...deepClone(props.tie),
  ...(props.source != null ? { sourceId: props.source._id } : {})
})

const syncChannels = () => {
  if (keepChannelsSynced.value) {
    target.value.outputChannels.audio = target.value.outputChannels.video
  }
}

const keepChannelsSynced = ref(target.value.outputChannels.video === target.value.outputChannels.audio)
watch(keepChannelsSynced, syncChannels)
watch(() => target.value.outputChannels.video, syncChannels)

const audioOutputChannel = computed({
  get: () => v$.outputChannels.audio.$model as number,
  set: value => {
    v$.outputChannels.audio.$model = value
  }
})

const videoOutputChannel = computed({
  get: () => v$.outputChannels.video.$model as number,
  set: value => {
    v$.outputChannels.video.$model = value
  }
})

const switcher = computed(() => switches.items.find(s => s._id === target.value.switchId))

const driver = computed(() =>
  switcher.value != null ? drivers.items.find(d => d.guid === switcher.value?.driverId) : undefined
)

const hasOutputChannel = computed(() => Boolean((driver.value?.capabilities ?? 0) & kDeviceSupportsMultipleOutputs))
const canDecoupleAudio = computed(
  () =>
    hasOutputChannel.value && // Can't have decoupled audio without this feature
    Boolean((driver.value?.capabilities ?? 0) & kDeviceCanDecoupleAudioOutput)
)

const confirm = () => {
  if (!hasOutputChannel.value) {
    // Ensure the video channel is undefined if no output channel is supported.
    target.value.outputChannels.video = undefined
  }

  if (!canDecoupleAudio.value) {
    // Ensure the audio channel is undefined if it cannot be decoupled.
    target.value.outputChannels.audio = undefined
  }

  isVisible.value = false
  emit('confirm', target.value)
}

const cancelIfConfirmed = async () => {
  if (!dirty.value) {
    cancel()

    return
  }

  const yes = await dialogs.confirm({
    message: props.editing ? t('message.discardChanges') : t('message.discardNew'),
    color: 'primary',
    confirmButton: t('action.discard'),
    cancelButton: t('common.cancel')
  })

  if (yes) {
    cancel()
  }
}

const cancel = () => {
  isVisible.value = false
}

const { integer, minValue, required, requiredIf, uuid } = useRules()
const rules = reactive({
  sourceId: { required, uuid },
  switchId: { required, uuid },
  inputChannel: { required, integer, ...minValue(1) },
  outputChannels: {
    video: { ...requiredIf(hasOutputChannel), integer, ...minValue(1) },
    audio: { ...requiredIf(canDecoupleAudio), integer, ...minValue(1) }
  }
})

const { dirty, getStatus, submit, v$ } = useValidation(rules, target, confirm)

const { cardProps, isFullscreen, body, showDividers } = useTieDialog()
</script>

<template>
  <VCard :laoding="isBusy" v-bind="cardProps">
    <VToolbar v-if="isFullscreen" :title="title" color="transparent">
      <template #prepend>
        <VBtn :icon="mdiClose" @click="cancelIfConfirmed" />
      </template>
      <template #append>
        <VBtn class="text-none" color="primary" @click="submit">{{ t('action.save') }}</VBtn>
      </template>
    </VToolbar>
    <template v-else>
      <VCardTitle>{{ title }}</VCardTitle>
      <VDivider v-if="showDividers" />
    </template>
    <VCardText ref="body">
      <VForm :disabled="isBusy">
        <VSelect
          v-model="v$.switchId.$model"
          :label="t('label.switch')"
          :items="switches.items"
          item-title="title"
          item-value="_id"
          :placeholder="t('placeholder.required')"
          v-bind="getStatus(v$.switchId)" />
        <div v-if="target.switchId != null" class="colg d-flex flex-wrap justify-start">
          <NumberInput
            v-model="v$.inputChannel.$model"
            class="flex-grow-0 w-300px"
            :label="t('label.inputChannel')"
            v-bind="getStatus(v$.inputChannel)"
            :min="1"
            :placeholder="t('placeholder.required')" />
          <template v-if="hasOutputChannel">
            <NumberInput
              v-model="videoOutputChannel"
              class="flex-grow-0 w-300px"
              :label="t('label.outputChannel')"
              v-bind="getStatus(v$.outputChannels.video)"
              :min="1"
              :placeholder="t('placeholder.required')" />
          </template>
        </div>
        <template v-if="canDecoupleAudio">
          <VSwitch v-model="keepChannelsSynced" :label="t('label.sync')" />
          <div class="colg d-flex flex-wrap justify-start">
            <NumberInput
              v-model="audioOutputChannel"
              class="flex-grow-0 w-300px"
              :label="t('label.audioChannel')"
              v-bind="getStatus(v$.outputChannels.audio)"
              :min="1"
              :placeholder="t('placeholder.required')"
              :disabled="keepChannelsSynced" />
          </div>
        </template>
      </VForm>
    </VCardText>
    <VDivider v-if="showDividers" />
    <VCardActions v-if="!isFullscreen">
      <VSpacer />
      <VBtn class="text-none" @click="cancel">{{ t('action.discard') }}</VBtn>
      <VBtn class="text-none" color="primary" @click="submit">{{ t('action.save') }}</VBtn>
    </VCardActions>
  </VCard>
</template>

<i18n lang="yaml">
en:
  label:
    addTie: Add tie
    editTie: Edit tie
    inputChannel: Input channel
    outputChannel: Output channel
    audioChannel: Output audio channel
    sync: Synchronise audio and vidoe channels
  message:
    discardNew: Do you want to discard this tie?
</i18n>
