<script setup lang="ts">
import { mdiArrowLeft, mdiDelete, mdiPlus, mdiVideoInputHdmi } from '@mdi/js'
import { computed, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Page from '../components/Page.vue'
import { toFiles, useObjectUrls } from '../helpers/attachment'
import { useGuardedAsyncOp } from '../helpers/utilities'
import SourceDialog from '../modals/SourceDialog.vue'
import { useDialogs, useSourceDialog } from '../modals/dialogs'
import { useSources } from '../services/source'
import type { I18nSchema } from '../locales/locales'
import type { Source } from '../services/source'
import type { DocumentId } from '../services/store'

//
// Utilities
//

const { t } = useI18n<I18nSchema>()
const router = useRouter()
const dialogs = useDialogs()

//
// Listing
//

const sources = useSources()
const files = computed(() =>
  sources.items.map((source) =>
    toFiles(source._attachments).find((f) => source.image != null && f.name === source.image)
  )
)
const images = useObjectUrls(files)

const refresh = useGuardedAsyncOp(async function refresh() {
  await sources.all()
})

onBeforeMount(refresh)

async function showSource(source: Source) {
  await router.push({ name: 'sources-id', params: { id: source._id } })
}

const deleteSource = async (id: DocumentId) => {
  const yes = await dialogs.confirm({
    message: t('message.confirmSourceDelete'),
    confirmButton: t('action.delete'),
    cancelButton: t('action.keep'),
    color: 'error'
  })

  if (!yes) {
    return
  }

  try {
    await sources.remove(id)
  } catch (e) {
    await dialogs.error(e)
    await refresh()
  }
}

const { dialogProps: editorProps } = useSourceDialog()
</script>

<template>
  <Page v-slot="{ toolbar, scrolled }">
    <VToolbar v-bind="toolbar" :title="t('label.sources')">
      <template #prepend><VBtn :icon="mdiArrowLeft" @click="router.back" /></template>
    </VToolbar>
    <VProgressLinear v-show="sources.isBusy" indeterminate />
    <VList v-scroll.self="scrolled" bg-color="transparent" :disabled="sources.isBusy">
      <template v-for="(item, index) of sources.items" :key="item._id">
        <VDivider v-if="index > 0" class="mx-4" />
        <VListItem :title="item.title" :to="{ name: 'sources-id', params: { id: item._id } }" lines="one">
          <template #prepend>
            <VAvatar color="surface-lighten-1">
              <VImg v-if="images[index]" :aspect-ratio="1" :src="images[index]" :cover="false" />
              <VIcon v-else :icon="mdiVideoInputHdmi" size="36" />
            </VAvatar>
          </template>
          <template #append>
            <VTooltip :text="t('action.delete')">
              <template #activator="{ props }">
                <VBtn v-bind="props" :icon="mdiDelete" variant="text" @click.prevent.stop="deleteSource(item._id)" />
              </template>
            </VTooltip>
          </template>
        </VListItem>
      </template>
    </VList>
    <VDialog v-bind="editorProps">
      <template #default="{ isActive }">
        <SourceDialog v-model:visible="isActive.value" @confirm="showSource" />
      </template>
      <template #activator="{ props: dialog }">
        <VTooltip :text="t('action.addSource')">
          <template #activator="{ props: tooltip }">
            <VBtn
              v-bind="{ ...dialog, ...tooltip }"
              :icon="mdiPlus"
              class="ma-6"
              color="primary"
              position="fixed"
              location="bottom right" />
          </template>
        </VTooltip>
      </template>
    </VDialog>
  </Page>
</template>

<i18n lang="yaml">
en:
  action:
    addSource: New source
  message:
    confirmSourceDelete: Do you want to delete this source?
</i18n>
