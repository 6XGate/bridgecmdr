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
import { useGuardedAsyncOp } from '../helpers/utilities'
import { useClient } from '../services/rpc'
import { useSources } from '../services/sources'
import { useSwitches } from '../services/switches'
import { trackBusy } from '../services/tracking'
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
// Loading sources and switchs so we have a count.
// TODO: Maybe find a better way.
//

const sources = useSources()
const switches = useSwitches()

// Reduce flicker and shorten the path to the items length of the stores, update
// them only on refresh. We will only track the refresh.
const sourceCount = ref(0)
const switchCount = ref(0)

const { isBusy } = trackBusy(
  () => sources.isBusy,
  () => switches.isBusy
)

onMounted(
  useGuardedAsyncOp(async () => {
    await Promise.all([sources.all(), switches.all()])
    sourceCount.value = sources.items.length
    switchCount.value = switches.items.length
  })
)

onUnmounted(() => {
  sources.clear()
  switches.clear()
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
        :title="t('label.switches')"
        lines="two"
        :prepend-icon="mdiVideoSwitch"
        :subtitle="t('count.switches', { n: n(switchCount, 'integer') }, switchCount)"
        :to="{ name: 'switches' }" />
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
    switches: No switches | One switch | {n} switches
</i18n>
