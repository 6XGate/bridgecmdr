<script setup lang="ts">
import {
  mdiArrowLeft,
  mdiExitRun,
  mdiPower,
  mdiPowerSocket,
  mdiRefreshAuto,
  mdiThemeLightDark,
  mdiViewDashboard
} from '@mdi/js'
import { useAsyncState } from '@vueuse/core'
import { onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import OptionDialog from '../components/OptionDialog.vue'
import Page from '../components/Page.vue'
import { trackBusy } from '../hooks/tracking'
import { useGuardedAsyncOp } from '../hooks/utilities'
import { useClient } from '../services/rpc/trpc'
import useSettings from '../services/settings'
import type { I18nSchema } from '../locales/locales'

const { t } = useI18n<I18nSchema>()
const { isBusy, wait } = trackBusy()

const { state: appInfo } = useAsyncState(async () => await useClient().appInfo.query(), {
  name: 'Loading...',
  version: 'Loading...'
})

const settings = useSettings()

const router = useRouter()

const iconSizes = settings.iconSizes.map((size) => ({
  title: t('item.iconSize', { size }),
  value: size,
  props: { line: 'one' }
}))

const colorSchemeOptions = settings.colorSchemes.map((option) => ({
  title: t(`theme.${option}`),
  value: option,
  props: { line: 'one' }
}))

const powerOffWhenOptions = settings.powerOffWhenOptions.map((option) => ({
  title: t(`powerOff.${option}`),
  value: option,
  props: { line: 'one' }
}))

const autoStartEnabled = ref(false)
async function enableAutoStart() {
  await wait(settings.enableAutoStart())
  autoStartEnabled.value = true
}
async function disableAutoStart() {
  await wait(settings.disableAutoStart())
  autoStartEnabled.value = false
}
async function toggleAutoStart() {
  if (autoStartEnabled.value) await disableAutoStart()
  else await enableAutoStart()
}

function closeApp() {
  globalThis.close()
}

async function load() {
  autoStartEnabled.value = await wait(settings.checkAutoStart())
}

onBeforeMount(useGuardedAsyncOp(load))
</script>

<template>
  <Page v-slot="{ toolbar, scrolled }">
    <VToolbar v-bind="toolbar" :title="t('label.general')">
      <template #prepend><VBtn :icon="mdiArrowLeft" @click="router.back" /></template>
    </VToolbar>
    <VProgressLinear v-show="isBusy" indeterminate />
    <VList v-scroll.self="scrolled" :disabled="isBusy" bg-color="transparent">
      <VListItem
        :title="t('option.autoStart')"
        lines="two"
        :subtitle="t('description.autoStart', [appInfo.name])"
        :prepend-icon="mdiRefreshAuto"
        @click="toggleAutoStart">
        <template #append>
          <VDivider class="mr-3" vertical />
          <VSwitch
            :model-value="autoStartEnabled"
            density="compact"
            hide-details
            @click.prevent.stop="toggleAutoStart" />
        </template>
      </VListItem>
      <OptionDialog
        v-model="settings.iconSize"
        :items="iconSizes"
        :title="t('label.iconSize')"
        max-width="320"
        mandatory
        with-cancel>
        <template #activator="{ props }">
          <VListItem
            v-bind="props"
            :title="t('option.iconSize')"
            lines="two"
            :subtitle="t('item.iconSize', { size: settings.iconSize })"
            :prepend-icon="mdiViewDashboard" />
        </template>
      </OptionDialog>
      <OptionDialog
        v-model="settings.colorScheme"
        :items="colorSchemeOptions"
        :title="t('option.colorTheme')"
        max-width="320"
        mandatory
        with-cancel>
        <template #activator="{ props }">
          <VListItem
            v-bind="props"
            :title="t('option.colorTheme')"
            lines="two"
            :subtitle="t(`theme.${settings.colorScheme}`)"
            :prepend-icon="mdiThemeLightDark" />
        </template>
      </OptionDialog>
      <OptionDialog
        v-model="settings.powerOffWhen"
        :items="powerOffWhenOptions"
        :title="t('label.powerOffWhen')"
        max-width="480"
        mandatory
        with-cancel>
        <template #activator="{ props }">
          <VListItem
            v-bind="props"
            :title="t('option.powerOffWhen')"
            lines="two"
            :subtitle="t(`powerOff.${settings.powerOffWhen}`)"
            :prepend-icon="mdiPower" />
        </template>
      </OptionDialog>
      <VListItem
        :title="t('option.powerOnSwitchesAtStart')"
        lines="two"
        :subtitle="t('description.powerOnSwitchesAtStart', [appInfo.name])"
        :prepend-icon="mdiPowerSocket"
        @click="settings.powerOnSwitchesAtStart = !settings.powerOnSwitchesAtStart">
        <template #append>
          <VDivider class="mr-3" vertical />
          <VSwitch v-model="settings.powerOnSwitchesAtStart" density="compact" hide-details />
        </template>
      </VListItem>
      <VListItem
        :title="t('option.closeApp', [appInfo.name])"
        lines="two"
        :subtitle="t('description.closeApp', [appInfo.name])"
        :prepend-icon="mdiExitRun"
        @click="closeApp" />
    </VList>
  </Page>
</template>

<i18n lang="yaml">
en:
  option:
    autoStart: Auto start
    iconSize: Dashboard icon size
    colorTheme: Color theme
    powerOffWhen: Power button will power off when
    powerOnSwitchesAtStart: Auto power on
    closeApp: Close {0}
  description:
    autoStart: Start {0} when the system starts
    powerOnSwitchesAtStart: Power on switches & monitors when {0} starts
    closeApp: Close {0} without powering down
  label:
    iconSize: Icon size
    powerOffWhen: Power off by
  item:
    iconSize: '{size} × {size}'
  powerOff:
    single: Single-tapped / single-clicked
    double: Double-tapped / double-clicked
  theme:
    dark: Dark
    light: Light
    no-preference: System theme
</i18n>
