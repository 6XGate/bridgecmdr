<script setup lang="ts">
import {
  mdiAlertCircleOutline,
  mdiArrowLeft,
  mdiGamepadVariant,
  mdiHelpCircleOutline,
  mdiVideoSwitch,
  mdiSwapVertical
} from '@mdi/js'
import { useAsyncState } from '@vueuse/core'
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Page from '../components/Page.vue'
import { trackBusy } from '../hooks/tracking'
import { useGuardedAsyncOp } from '../hooks/utilities'
import { useDevices } from '../services/data/devices'
import { useSources } from '../services/data/sources'
import { useClient } from '../services/rpc/trpc'
import type { I18nSchema } from '../locales/locales'

//
// Utilities
//

const { t, n } = useI18n<I18nSchema>()
const router = useRouter()

//
// Application info
//

const { state: appInfo } = useAsyncState(async () => await useClient().appInfo.query(), {
  name: 'Loading...',
  version: 'Loading...'
})

//
// Loading sources and devices so we have a count.
// TODO: Maybe find a better way.
//

const sources = useSources()
const devices = useDevices()

// Reduce flicker and shorten the path to the items length of the stores, update
// them only on refresh. We will only track the refresh.
const sourceCount = ref(0)
const deviceCount = ref(0)

const { isBusy } = trackBusy(
  () => sources.isBusy,
  () => devices.isBusy
)

onMounted(
  useGuardedAsyncOp(async () => {
    await Promise.all([sources.all(), devices.all()])
    sourceCount.value = sources.items.length
    deviceCount.value = devices.items.length
  })
)

onUnmounted(() => {
  sources.clear()
  devices.clear()
})
</script>

<template>
  <Page v-slot="{ toolbar, scrolled }">
    <VToolbar v-bind="toolbar" :title="t('label.settings')" flat>
      <template #prepend><VBtn :icon="mdiArrowLeft" @click="router.back" /></template>
    </VToolbar>
    <VProgressLinear v-show="isBusy" indeterminate />
    <VList v-scroll.self="scrolled" bg-color="transparent" :disabled="isBusy">
      <VListItem
        :title="t('label.general')"
        lines="two"
        :prepend-icon="mdiAlertCircleOutline"
        :subtitle="t('description.general', [appInfo.name])"
        :to="{ name: 'settings-general' }" />
      <VListItem
        :title="t('label.sources')"
        lines="two"
        :prepend-icon="mdiGamepadVariant"
        :subtitle="t('count.sources', { n: n(sourceCount, 'integer') }, sourceCount)"
        :to="{ name: 'sources' }" />
      <VListItem
        :title="t('label.switchesAndMonitors')"
        lines="two"
        :prepend-icon="mdiVideoSwitch"
        :subtitle="t('count.devices', { n: n(deviceCount, 'integer') }, deviceCount)"
        :to="{ name: 'devices' }" />
      <VListItem
        :title="t('label.backup')"
        :prepend-icon="mdiSwapVertical"
        :subtitle="t('description.backup')"
        lines="two"
        :to="{ name: 'settings-backup' }" />
      <VListItem
        :title="t('label.about', [appInfo.name])"
        lines="two"
        :prepend-icon="mdiHelpCircleOutline"
        :subtitle="t('description.about', [appInfo.version])" />
    </VList>
  </Page>
</template>

<i18n lang="yaml">
en:
  label:
    about: About {0}
  description:
    general: Basic settings for {0}
    backup: Import or export setting as a file.
    about: Version {0}
  count:
    sources: No sources | One source | {n} sources
    devices: No devices | One device | {n} devices
</i18n>
