<script setup lang="ts">
import { mdiClose, mdiFlask } from '@mdi/js'
import { useVModel } from '@vueuse/core'
import { computed, ref, reactive, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { Highlight } from '../components/Highlight'
import { useLocation } from '../hooks/location'
import { useRules, useValidation } from '../hooks/validation'
import useDrivers from '../services/driver'
import usePorts from '../services/ports'
import { useDialogs, useSwitchDialog } from './dialogs'
import type { I18nSchema } from '../locales/locales'
import type { NewSwitch } from '../services/switches'
import type { DeepReadonly } from 'vue'

const props = defineProps<{
  // Dialog
  // eslint-disable-next-line vue/no-unused-properties -- useVModel
  visible?: boolean
  // Form
  editing: boolean
  switch: DeepReadonly<NewSwitch>
}>()

const emit = defineEmits<{
  (on: 'update:visible', value: boolean): void
  (on: 'confirm', value: NewSwitch): void
}>()

const { t } = useI18n<I18nSchema>()
const dialogs = useDialogs()

const isVisible = useVModel(props, 'visible', emit)

const drivers = useDrivers()
onBeforeMount(drivers.all)

const ports = usePorts()
onBeforeMount(ports.all)

// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- Prop reactivity not desired.
const target = ref<NewSwitch>(structuredClone(props.switch))
const location = computed({
  get: () => v$.path.$model,
  set: (v) => {
    v$.path.$model = v
  }
})

const { locationPath, pathTypes, pathType, path } = useLocation(location, () => ports.items)

const driver = computed(() => drivers.items.find((d) => d.guid === target.value.driverId))
const driverSerach = ref('')
const driverKind = computed(() => (driver.value?.kind === 'monitor' ? t('label.monitor') : t('label.switch')))

function confirm() {
  isVisible.value = false
  emit('confirm', target.value)
}

async function cancelIfConfirmed() {
  if (!dirty.value) {
    cancel()

    return
  }

  const yes = await dialogs.confirm({
    message: props.editing ? t('message.discardChanges') : t('message.discardNew', [driverKind.value]),
    color: 'primary',
    confirmButton: t('action.discard'),
    cancelButton: t('common.cancel')
  })

  if (yes) {
    cancel()
  }
}

function cancel() {
  isVisible.value = false
}

const { required, minLength, uuid } = useRules()
const rules = reactive({
  driverId: { required, uuid },
  title: { required, ...minLength(1) },
  path: { required, locationPath }
})

const { dirty, getStatus, submit, v$ } = useValidation(rules, target, confirm)

const { cardProps, isFullscreen, body, showDividers } = useSwitchDialog()

const isBusy = computed(() => drivers.isBusy || ports.isBusy)

const title = computed(() =>
  props.editing ? t('label.addDevice', [driverKind.value]) : t('label.editDevice', [driverKind.value])
)
</script>

<template>
  <VCard v-bind="cardProps" :loading="isBusy">
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
      <VForm>
        <VTextField
          v-model="v$.title.$model"
          :label="t('label.name')"
          :placeholder="t('placeholder.required')"
          variant="outlined"
          v-bind="getStatus(v$.title)" />
        <VSelect
          v-model="v$.driverId.$model"
          v-model:search="driverSerach"
          :label="t('label.driver')"
          :items="drivers.items"
          item-title="title"
          item-value="guid"
          :menu-props="{ location: 'center' }"
          variant="outlined"
          :loading="drivers.isBusy"
          :placeholder="t('placeholder.required')"
          v-bind="getStatus(v$.driverId)">
          <template v-if="driver?.experimental === true" #append-inner>
            <VTooltip :text="t('label.experimental')">
              <template #activator="{ props: tooltipProps }">
                <VIcon v-bind="tooltipProps" :icon="mdiFlask" />
              </template>
            </VTooltip>
          </template>
          <template #item="{ props: itemProps, item }">
            <VListItem v-bind="itemProps">
              <template #title><Highlight :text="item.title" :search="driverSerach"></Highlight></template>
              <template v-if="item.raw.experimental" #append>
                <VTooltip :text="t('label.experimental')">
                  <template #activator="{ props: tooltipProps }">
                    <VIcon v-bind="tooltipProps" :icon="mdiFlask" />
                  </template>
                </VTooltip>
              </template>
            </VListItem>
          </template>
        </VSelect>
        <div class="colg d-flex flex-wrap justify-start">
          <VSelect v-model="pathType" class="flex-grow-0 w-175px" :items="pathTypes" variant="outlined" item-props />
          <VTextField
            v-if="pathType !== 'port'"
            v-model="path"
            variant="outlined"
            :placeholder="t('placeholder.required')"
            v-bind="getStatus(v$.path)" />
          <VSelect
            v-else
            v-model="path"
            :items="ports.items"
            item-value="path"
            variant="outlined"
            :loading="ports.isBusy"
            :placeholder="t('placeholder.required')"
            v-bind="getStatus(v$.path)" />
        </div>
      </VForm>
    </VCardText>
    <VDivider v-if="showDividers" />
    <VCardActions v-if="!isFullscreen">
      <VSpacer />
      <VBtn class="text-none" @click="cancel">{{ t('action.discard') }}</VBtn>
      <VBtn class="text-none" color="primary" :disabled="isBusy" @click="submit">
        {{ t('action.save') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<i18n lang="yaml">
en:
  label:
    monitor: monitor
    switch: switch
    addDevice: Add {0}
    editDevice: Edit {0}
    experimental: Experimental driver
  message:
    discardNew: Do you want to discard this {0}?
</i18n>
