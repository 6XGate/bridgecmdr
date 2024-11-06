<script setup lang="ts">
import { mdiArrowLeft, mdiExport, mdiImport } from '@mdi/js'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Page from '../components/Page.vue'
import { trackBusy } from '../hooks/tracking'
import { useDialogs } from '../modals/dialogs'
import { exportSettings } from '../services/backup/export'
import { importSettings } from '../services/backup/import'
import { openFile, saveFile } from '../support/files'
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
    const file = await wait(exportSettings())
    await saveFile(file)
  } catch (e) {
    await dialogs.error(e, {
      title: t('error.export')
    })
  }
}

async function importFromFile() {
  try {
    const files = await openFile({ accepts: '.zip' })

    const file = files?.at(0)
    if (file == null) return

    await wait(importSettings(file))
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
    <VProgressLinear v-show="isBusy" indeterminate />
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
    archive: Settings archive
  error:
    export: Failed to export settings
    import: Failed to import settings
</i18n>
