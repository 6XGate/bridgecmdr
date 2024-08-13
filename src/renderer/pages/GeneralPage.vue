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
import { onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import OptionDialog from '../components/OptionDialog.vue'
import { useGuardedAsyncOp } from '../helpers/utilities'
import useSettings from '../stores/settings'
import type { I18nSchema } from '../locales/locales'

const { t } = useI18n<I18nSchema>()

const settings = useSettings()

const router = useRouter()

const iconSizes = settings.iconSizes.map(size => ({
  title: t('item.iconSize', { size }),
  value: size,
  props: { line: 'one' }
}))

const colorSchemeOptions = settings.colorSchemes.map(option => ({
  title: t(`theme.${option}`),
  value: option,
  props: { line: 'one' }
}))

const powerOffWhenOptions = settings.powerOffWhenOptions.map(option => ({
  title: t(`powerOff.${option}`),
  value: option,
  props: { line: 'one' }
}))

const autoStartEnabled = ref(false)
const enableAutoStart = async () => {
  await settings.enableAutoStart()
  autoStartEnabled.value = true
}
const disableAutoStart = async () => {
  await settings.disableAutoStart()
  autoStartEnabled.value = false
}
const toggleAutoStart = async () => {
  if (autoStartEnabled.value) await disableAutoStart()
  else await enableAutoStart()
}

const closeApp = () => {
  globalThis.close()
}

const load = useGuardedAsyncOp(async () => {
  autoStartEnabled.value = await settings.checkAutoStart()
})

onBeforeMount(load)
</script>

<template>
  <Page v-slot="{ toolbar, scrolled }">
    <VToolbar v-bind="toolbar" :title="t('label.general')">
      <template #prepend><VBtn :icon="mdiArrowLeft" @click="router.back" /></template>
    </VToolbar>
    <VList v-scroll.self="scrolled" bg-color="transparent">
      <VListItem
        :title="t('option.autoStart')"
        lines="two"
        :subtitle="t('description.autoStart')"
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
        :subtitle="t('description.powerOnSwitchesAtStart')"
        :prepend-icon="mdiPowerSocket"
        @click="settings.powerOnSwitchesAtStart = !settings.powerOnSwitchesAtStart">
        <template #append>
          <VDivider class="mr-3" vertical />
          <VSwitch v-model="settings.powerOnSwitchesAtStart" density="compact" hide-details />
        </template>
      </VListItem>
      <VListItem
        :title="t('option.closeApp')"
        lines="two"
        :subtitle="t('description.closeApp')"
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
    closeApp: Close BridgeCmdr
  description:
    autoStart: Start BridgeCmdr when the system starts
    powerOnSwitchesAtStart: Power on switches & monitors when BridgeCmdr starts
    closeApp: Close BridgeCmdr without powering down
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
