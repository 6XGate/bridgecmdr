<script setup lang="ts">
import { mdiArrowLeft, mdiDelete, mdiExport, mdiImport, mdiPlus, mdiVolumeMedium } from '@mdi/js'
import { computed, ref, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import InputDialog from '../components/InputDialog.vue'
import Page from '../components/Page.vue'
import ReplacableImage from '../components/ReplacableImage.vue'
import { trackBusy } from '../hooks/tracking'
import { useGuardedAsyncOp } from '../hooks/utilities'
import TieDialog from '../modals/TieDialog.vue'
import { useDialogs, useTieDialog } from '../modals/dialogs'
import useDrivers from '../services/driver'
import { useSources } from '../services/sources'
import { useSwitches } from '../services/switches'
import { useTies } from '../services/ties'
import { toAttachments, toFiles } from '../support/files'
import type { I18nSchema } from '../locales/locales'
import type { DriverInformation } from '../services/driver'
import type { Source } from '../services/sources'
import type { DocumentId } from '../services/store'
import type { Switch } from '../services/switches'
import type { NewTie, Tie } from '../services/ties'
import type { DeepReadonly } from 'vue'
import { isNotNullish } from '@/basics'

interface Props {
  id: string
}

const props = defineProps<Props>()

//
// Utilities
//

const { t } = useI18n<I18nSchema>()
const dialogs = useDialogs()
const router = useRouter()

//
// Source
//

const sources = useSources()
const source = ref<Source>()
const file = ref<File>()

const loadSource = useGuardedAsyncOp(async function loadSource() {
  source.value = { ...(await sources.get(props.id)) }
  file.value = toFiles(source.value._attachments).find(
    (f) => source.value?.image != null && f.name === source.value.image
  )
})

async function save() {
  if (source.value == null) {
    throw new ReferenceError('No source loaded')
  }

  if (file.value == null) {
    throw new ReferenceError('No image file loaded or defined')
  }

  try {
    source.value.image = file.value.name
    source.value = {
      ...(await sources.update(source.value, ...(await toAttachments([file.value]))))
    }
    file.value = toFiles(source.value._attachments).find(
      (f) => source.value?.image != null && f.name === source.value.image
    )
  } catch (e) {
    await loadSource()
    await loadTies()
    await dialogs.error(e)
  }
}

async function updateImage(newFile: File) {
  file.value = newFile
  await save()
}

onBeforeMount(loadSource)

//
// Ties
//

interface TieEntry {
  switch: DeepReadonly<Switch>
  driver: DriverInformation
  tie: DeepReadonly<Tie>
}

const switches = useSwitches()
const drivers = useDrivers()
const ties = useTies()
const entries = computed(() =>
  ties.items
    .map(function makeEntriy(tie) {
      const switcher = switches.items.find((s) => s._id === tie.switchId)
      const driver = switcher != null ? drivers.items.find((d) => d.guid === switcher.driverId) : undefined

      return switcher != null && driver != null ? ({ switch: switcher, driver, tie } satisfies TieEntry) : undefined
    })
    .filter(isNotNullish)
)

const loadTies = useGuardedAsyncOp(async function loadTies() {
  await Promise.all([switches.all(), ties.forSource(props.id)])
})

onBeforeMount(loadTies)
onBeforeMount(drivers.all)

async function addTie(target: NewTie) {
  try {
    await ties.add(target)
  } catch (e) {
    await loadSource()
    await loadTies()
    await dialogs.error(e)
  }
}

async function updateTie(target: DeepReadonly<Tie>, changes: NewTie) {
  try {
    await ties.update({ ...target, ...changes })
  } catch (e) {
    await loadSource()
    await loadTies()
    await dialogs.error(e)
  }
}

async function deleteTie(id: DocumentId) {
  const yes = await dialogs.confirm({
    message: t('message.confirmDeleteTie'),
    confirmButton: t('action.delete'),
    cancelButton: t('action.keep'),
    color: 'error'
  })

  if (!yes) {
    return
  }

  try {
    await ties.remove(id)
  } catch (e) {
    await loadSource()
    await loadTies()
    await dialogs.error(e)
  }
}

const { dialogProps: editorProps } = useTieDialog()

const { isBusy } = trackBusy(
  () => sources.isBusy,
  () => switches.isBusy,
  () => drivers.isBusy,
  () => ties.isBusy
)
</script>

<template>
  <Page>
    <VProgressLinear v-show="isBusy" indeterminate />
    <div class="overflow-y-auto px-6 py-3">
      <div class="d-flex justify-center mb-5">
        <ReplacableImage :image="file" @update="updateImage" />
      </div>
      <VList v-if="source != null" bg-color="transparent" :disabled="isBusy">
        <InputDialog
          v-model="source.title"
          :title="t('label.name')"
          max-width="480"
          mandatory
          with-cancel
          @update:model-value="save">
          <template #activator="{ props: dialog }">
            <VListItem v-bind="dialog" :title="source.title" lines="two" :subtitle="t('label.source')" />
          </template>
        </InputDialog>
      </VList>
      <VCard variant="tonal">
        <VCardText>{{ t('label.ties') }}</VCardText>
        <VCardText v-if="entries.length === 0" class="text-disabled">{{ t('message.noTies') }}</VCardText>
        <template v-for="entry of entries" :key="entry.tie._id">
          <VDialog v-bind="editorProps">
            <template #default="{ isActive }">
              <TieDialog
                v-model:visible="isActive.value"
                :tie="entry.tie"
                editing
                @confirm="(v) => updateTie(entry.tie, v)" />
            </template>
            <template #activator="{ props: dialog }">
              <VListItem v-bind="dialog" lines="three" :title="entry.switch.title" :subtitle="entry.driver.title">
                <VChip
                  :prepend-icon="mdiImport"
                  class="mr-1"
                  size="x-small"
                  :text="String(entry.tie.inputChannel)"
                  label />
                <VChip
                  v-if="entry.tie.outputChannels.video"
                  :prepend-icon="mdiExport"
                  class="mr-1"
                  size="x-small"
                  :text="String(entry.tie.outputChannels.video)"
                  label />
                <VChip
                  v-if="entry.tie.outputChannels.audio"
                  :prepend-icon="mdiVolumeMedium"
                  class="mr-1"
                  size="x-small"
                  :text="String(entry.tie.outputChannels.audio)"
                  label />
                <template #append>
                  <VTooltip :text="t('action.delete')">
                    <template #activator="{ props: tooltip }">
                      <VBtn
                        v-bind="tooltip"
                        :icon="mdiDelete"
                        variant="text"
                        @click.prevent.stop="deleteTie(entry.tie._id)" />
                    </template>
                  </VTooltip>
                </template>
              </VListItem>
            </template>
          </VDialog>
        </template>
      </VCard>
    </div>
    <VSheet class="ma-2" color="transparent" location="top left" position="fixed">
      <VBtn v-bind="props" :icon="mdiArrowLeft" class="mr-3" variant="text" @click="router.back" />
    </VSheet>
    <VSheet v-if="source != null" class="ma-6" color="transparent" location="bottom right" position="fixed">
      <VTooltip :text="t('action.addTie')">
        <template #activator="{ props: tooltip }">
          <VDialog v-bind="editorProps">
            <template #default="{ isActive }">
              <TieDialog
                v-model:visible="isActive.value"
                :source="source"
                :tie="ties.blank()"
                :editing="false"
                @confirm="addTie" />
            </template>
            <template #activator="{ props: dialog }">
              <VBtn v-bind="{ ...tooltip, ...dialog }" :icon="mdiPlus" class="ml-3" color="primary" />
            </template>
          </VDialog>
        </template>
      </VTooltip>
    </VSheet>
  </Page>
</template>

<i18n lang="yaml">
en:
  action:
    addTie: New tie
  message:
    confirmDeleteTie: Do you want to delete this tie?
    noTies: No ties, add some
</i18n>
