<script setup lang="ts">
import { mdiPower, mdiVideoInputHdmi, mdiWrench } from '@mdi/js'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNextTick } from '@/helpers/vue'
import { useDashboard } from '@/stores/dashboard'
import useSettings from '@/stores/settings.js'
import useBridgedApi from '@/system/bridged'
import useFirstRun from '@/utilities/first'
import type { I18nSchema } from '@/locales/locales'
import log from 'electron-log'

const settings = useSettings()
const buttonSize = computed(() => `${settings.iconSize + 12}px`)
const iconSize = computed(() => `${settings.iconSize}px`)
const api = useBridgedApi()

const { t } = useI18n<I18nSchema>()

const powerTooltip = computed(() =>
  (settings.powerOffWhen === 'double'
    ? t('tooltip.doubleTapPowerOff')
    : t('tooltip.powerOff')))

const powerOff = () => {
  if (import.meta.env.PROD) {
    api.system.powerOff().catch(e => { log.error(e) })
  }

  window.close()
}

const powerButton = computed(() =>
  (settings.powerOffWhen === 'double'
    ? { onDblclick: () => { powerOff() } }
    : { onClick: () => { powerOff() } })
)

const dashboard = useDashboard()
onMounted(dashboard.refresh)

const firstRun = useFirstRun()
const doFirstRun = useNextTick(firstRun.doFirstRun)
onMounted(doFirstRun)
</script>

<template>
  <VMain scrollable>
    <VContainer>
      <div v-if="dashboard.isBusy" class="align-center d-flex justify-ceneter">
        <VProgressCircular size="256px" indeterminate/>
      </div>
      <template v-for="button of dashboard.items" :key="button.guid">
        <VTooltip :text="button.title" location="bottom">
          <template #activator="{ props }">
            <VBtn stack v-bind="props" :width="buttonSize" :height="buttonSize" class="ma-2"
                  variant="flat" rounded="lg" :active="button.isActive"
                  @click="button.activate">
              <VIcon v-if="button.image == null" :icon="mdiVideoInputHdmi"
                     :size="settings.iconSize"/>
              <VImg v-else :src="button.image" :width="iconSize" :height="iconSize"/>
            </VBtn>
          </template>
        </VTooltip>
      </template>
      <VSheet color="transparent" class="ma-6" location="bottom right" position="fixed">
        <!-- TODO: Power button -->
        <VTooltip :text="powerTooltip">
          <template #activator="{ props }">
            <VBtn v-bind="{ ...props, ...powerButton }" :icon="mdiPower"
                  class="ml-3" color="error"/>
          </template>
        </VTooltip>
        <VTooltip :text="t('tooltip.openSettings')" left>
          <template #activator="{ props }">
            <VBtn v-bind="props" :icon="mdiWrench" class="ml-3" color="secondary"
                  :to="{ name: 'settings' }"/>
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
