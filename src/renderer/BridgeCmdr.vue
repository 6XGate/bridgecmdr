<script setup lang='ts'>
import { useEventListener, useTitle } from '@vueuse/core'
import { watch, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import AlertModal from '@/modals/AlertModal.vue'
import ConfirmModal from '@/modals/ConfirmModal.vue'
import { useDialogs } from '@/modals/dialogs'
import useSettings from '@/stores/settings'
import useAppUpdates from '@/system/appUpdates'
import type { I18nSchema } from '@/locales/locales'
import type { UpdateProgressEvent } from '@/system/appUpdates'
import type { ProgressInfo } from 'electron-updater'

const settings = useSettings()
const theme = useTheme()
watch(() => settings.activeColorScheme, () => {
  theme.global.name.value = settings.activeColorScheme
}, { immediate: true })

const dialogs = useDialogs()
const { t, n } = useI18n<I18nSchema>()

useTitle(t('product'))

const appUpdater = useAppUpdates()
const progress = ref<ProgressInfo>()
useEventListener(appUpdater, 'progress', (ev: UpdateProgressEvent) => {
  console.log(ev)
  progress.value = ev
})

const checkForUpdate = async () => {
  const info = await appUpdater.checkForUpdates()
  if (info == null) {
    return
  }

  const yes = await dialogs.confirm({
    title: t('message.confirmUpdate'),
    message: t('message.versionAvailale', { version: info.version }),
    confirmButton: t('action.update'),
    cancelButton: t('action.later')
  })

  if (yes) {
    try {
      await appUpdater.downloadUpdate()

      await dialogs.alert(t('message.updateReady'))

      await appUpdater.installUpdate()
      window.close()
    } finally {
      progress.value = undefined
    }
  }
}

const kRoundOptions = {
  style: 'unit',
  minimumFractionDigits: 1,
  maximumFractionDigits: 2
} satisfies Intl.NumberFormatOptions

const kRoundTo = {
  gb: 1073741824,
  mb: 1048576,
  kb: 1024
}

const roundByteSize = (amount: number, type: 'size' | 'speed' = 'size') => {
  switch (true) {
    case amount > kRoundTo.gb:
      return n(amount / kRoundTo.gb, { ...kRoundOptions, unit: type === 'speed' ? 'gigabyte-per-second' : 'gigabyte' })
    case amount > kRoundTo.mb:
      return n(amount / kRoundTo.mb, { ...kRoundOptions, unit: type === 'speed' ? 'megabyte-per-second' : 'megabyte' })
    case amount > kRoundTo.kb:
      return n(amount / kRoundTo.kb, { ...kRoundOptions, unit: type === 'speed' ? 'kilobyte-per-second' : 'kilobyte' })
    default:
      return n(amount, { ...kRoundOptions, unit: type === 'speed' ? 'byte-per-second' : 'byte' })
  }
}

onMounted(async () => { await checkForUpdate() })
</script>

<template>
  <VApp id="bridgecmdr">
    <RouterView v-slot="{ Component: Route, route }">
      <VScrollXTransition leave-absolute>
        <Component :is="Route" :key="route.name"/>
      </VScrollXTransition>
    </RouterView>
  </VApp>
  <!-- Update progress dialog -->
  <VDialog v-if="progress != null" :model-value="progress != null" max-width="640">
    <VCard title="Downloading update...">
      <VCardText>
        {{ t('message.progress', {
          amount: roundByteSize(progress.transferred),
          total: roundByteSize(progress.total),
          speed: roundByteSize(progress.bytesPerSecond)
        }) }}
      </VCardText>
      <VCardText>
        <VProgressLinear :model-value="progress.percent"/>
      </VCardText>
    </VCard>
  </VDialog>
  <!-- Common dialogs -->
  <AlertModal/>
  <ConfirmModal/>
</template>

<i18n lang="yaml">
en:
  message:
    confirmUpdate: Do you want to update BridgeCmdr?
    versionAvailale: The new version, {version}, is available for download.
    progress: Downloaded {amount} of {total} at {speed}...
    updateReady: Download complete, ready to restart and update
  action:
    update: Update
    later: Maybe later
</i18n>
