<script setup lang="ts">
import { mdiArrowLeft, mdiExport, mdiImport } from '@mdi/js'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Page from '../components/Page.vue'
import { exportSettings } from '../data/backup/export'
import { importSettings } from '../data/backup/import'
import { useDialogs } from '../modals/dialogs'
import { trackBusy } from '../utilities/tracking'
import type { I18nSchema } from '../locales/locales'

//
// Utilities
//

const { t } = useI18n<I18nSchema>()
const { wait, isBusy } = trackBusy()
const dialogs = useDialogs()
const router = useRouter()

//
// Functionality.
//

async function exportToFile() {
  try {
    await wait(async () => {
      await exportSettings()
    })
    throw new Error('not implemented')
  } catch (e) {
    await dialogs.error(e, {
      title: t('error.export')
    })
  }
}

async function importFromFile() {
  try {
    const files = await globalThis.services.system.showOpenDialog({
      title: t('label.import'),
      filters: [{ extensions: ['zip'], name: 'Settings archive' }],
      properties: ['openFile', 'dontAddToRecent']
    })

    if (files?.[0] == null) return
    const file = files[0]

    await wait(async () => {
      await importSettings(file)
    })
  } catch (e) {
    await dialogs.error(e, {
      title: t('error.import')
    })
  }
}
</script>

<template>
  <Page v-slot="{ toolbar, scrolled }">
    <VToolbar v-bind="toolbar" :title="t('label.backup')" flat>
      <template #prepend><VBtn :icon="mdiArrowLeft" @click="router.back" /></template>
    </VToolbar>
    <VList v-scroll.self="scrolled" bg-color="transparent" :disabled="isBusy">
      <VListItem
        :title="t('label.export')"
        :subtitle="t('description.export')"
        :prepend-icon="mdiExport"
        lines="two"
        @click="exportToFile" />
      <VListItem
        :title="t('label.import')"
        :subtitle="t('description.import')"
        :prepend-icon="mdiImport"
        lines="two"
        @click="importFromFile" />
    </VList>
  </Page>
</template>

<i18n lang="yaml">
en:
  label:
    export: Export settings
    import: Import settings
  description:
    export: Export settings from to archive
    import: Import settings from an archive
  error:
    export: Failed to export settings
    import: Failed to import settings
</i18n>
