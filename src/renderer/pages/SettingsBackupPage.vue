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

const kFilters = [{ extensions: ['zip'], name: t('description.archive') }]

async function exportToFile() {
  try {
    const file = await wait(exportSettings())
    await globalThis.services.system.saveFile(file, {
      title: t('label.export'),
      filters: kFilters,
      properties: ['showOverwriteConfirmation']
    })
  } catch (e) {
    await dialogs.error(e, {
      title: t('error.export')
    })
  }
}

async function importFromFile() {
  try {
    const files = await globalThis.services.system.openFile({
      title: t('label.import'),
      filters: kFilters,
      properties: ['openFile', 'dontAddToRecent']
    })

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
