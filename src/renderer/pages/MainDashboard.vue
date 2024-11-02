<script setup lang="ts">
import { mdiPower, mdiVideoInputHdmi, mdiWrench } from '@mdi/js'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGuardedAsyncOp } from '../hooks/utilities'
import { useDialogs } from '../modals/dialogs'
import { useDashboard } from '../services/dashboard'
import { useClient } from '../services/rpc'
import useSettings from '../services/settings'
import FirstRunLogic from './FirstRunLogic.vue'
import type { I18nSchema } from '../locales/locales'

const settings = useSettings()
const buttonSize = computed(() => `${settings.iconSize + 12}px`)
const iconSize = computed(() => `${settings.iconSize}px`)

const { t } = useI18n<I18nSchema>()

const powerTooltip = computed(() =>
  settings.powerOffWhen === 'double' ? t('tooltip.doubleTapPowerOff') : t('tooltip.powerOff')
)

const dialogs = useDialogs()

const dashboard = useDashboard()

const client = useClient()

async function powerOff() {
  try {
    await dashboard.powerOff()
    await client.system.powerOff.mutate()
  } catch (e) {
    await dialogs.error(e)
  }

  globalThis.close()
}

const powerButtonProps = computed(() =>
  settings.powerOffWhen === 'double' ? { onDblclick: powerOff } : { onClick: powerOff }
)

onMounted(useGuardedAsyncOp(dashboard.refresh))
</script>

<template>
  <VMain scrollable>
    <FirstRunLogic />
    <VContainer>
      <div v-if="dashboard.isBusy" class="align-center d-flex justify-ceneter">
        <VProgressCircular size="256px" indeterminate />
      </div>
      <template v-for="button of dashboard.items" :key="button.guid">
        <VTooltip :text="button.title" location="bottom">
          <template #activator="{ props }">
            <VBtn
              stack
              v-bind="props"
              :width="buttonSize"
              :height="buttonSize"
              class="ma-2"
              variant="flat"
              rounded="lg"
              :active="button.isActive"
              @click="button.activate">
              <VIcon v-if="button.image == null" :icon="mdiVideoInputHdmi" :size="settings.iconSize" />
              <VImg v-else :src="button.image" :width="iconSize" :height="iconSize" />
            </VBtn>
          </template>
        </VTooltip>
      </template>
      <VSheet color="transparent" class="ma-6" location="bottom right" position="fixed">
        <VTooltip :text="powerTooltip">
          <template #activator="{ props }">
            <VBtn v-bind="{ ...props, ...powerButtonProps }" :icon="mdiPower" class="ml-3" color="error" />
          </template>
        </VTooltip>
        <VTooltip :text="t('tooltip.openSettings')" left>
          <template #activator="{ props }">
            <VBtn v-bind="props" :icon="mdiWrench" class="ml-3" color="secondary" :to="{ name: 'settings' }" />
          </template>
        </VTooltip>
      </VSheet>
    </VContainer>
  </VMain>
</template>

<i18n lang="yaml">
en:
  tooltip:
    powerOff: Power off
    doubleTapPowerOff: Power off (double-click)
    openSettings: Open settings
</i18n>
