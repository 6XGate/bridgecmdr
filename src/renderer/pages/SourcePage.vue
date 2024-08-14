<script setup lang="ts">
import {
  mdiArrowLeft,
  mdiCamera,
  mdiDelete,
  mdiExport,
  mdiFileImagePlus,
  mdiImport,
  mdiPlus,
  mdiVideoInputHdmi,
  mdiVolumeMedium
} from '@mdi/js'
import videoInputHdmiIcon from '@mdi/svg/svg/video-input-hdmi.svg'
import { useObjectUrl } from '@vueuse/core'
import { computed, ref, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import FileUploadDialog from '../components/FileUploadDialog.vue'
import InputDialog from '../components/InputDialog.vue'
import Page from '../components/Page.vue'
import { toFiles } from '../helpers/attachment'
import TieDialog from '../modals/TieDialog.vue'
import { useDialogs, useTieDialog } from '../modals/dialogs'
import { useDrivers } from '../system/driver'
import { useSources } from '../system/source'
import { useSwitches } from '../system/switch'
import { useTies } from '../system/tie'
import { trackBusy } from '../utilities/tracking'
import type { DocumentId } from '../data/database'
import type { I18nSchema } from '../locales/locales'
import type { DriverInformation } from '../system/driver'
import type { Source } from '../system/source'
import type { Switch } from '../system/switch'
import type { NewTie, Tie } from '../system/tie'
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
const { track, wait, isBusy } = trackBusy()

//
// Source
//

const sources = useSources()
const source = ref<Source>()
const file = ref<File>()
const image = useObjectUrl(file)

const loadSource = async () => {
  source.value = { ...(await sources.get(props.id)) }
  file.value = toFiles(source.value._attachments).find(
    (f) => source.value?.image != null && f.name === source.value.image
  )
}

const save = async () => {
  if (source.value == null) {
    throw new ReferenceError('No source loaded')
  }

  if (file.value == null) {
    throw new ReferenceError('No image file loaded or defined')
  }

  try {
    source.value.image = file.value.name
    source.value = { ...(await wait(sources.update(source.value, ...[file.value].filter(isNotNullish)))) }
    file.value = toFiles(source.value._attachments).find(
      (f) => source.value?.image != null && f.name === source.value.image
    )
  } catch (e) {
    await loadSource()
    await loadTies()
    await dialogs.error(e)
  }
}

onBeforeMount(track(loadSource))

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
    .map((tie) => {
      const switcher = switches.items.find((s) => s._id === tie.switchId)
      const driver = switcher != null ? drivers.items.find((d) => d.guid === switcher.driverId) : undefined

      return switcher != null && driver != null ? ({ switch: switcher, driver, tie } satisfies TieEntry) : undefined
    })
    .filter(isNotNullish)
)

const loadTies = async () => {
  await switches.all()
  await ties.forSource(props.id)
}

onBeforeMount(track(loadTies))

const addTie = async (target: NewTie) => {
  try {
    await wait(ties.add(target))
  } catch (e) {
    await loadSource()
    await loadTies()
    await dialogs.error(e)
  }
}

const updateTie = async (target: DeepReadonly<Tie>, changes: NewTie) => {
  try {
    await wait(ties.update({ ...target, ...changes }))
  } catch (e) {
    await loadSource()
    await loadTies()
    await dialogs.error(e)
  }
}

const deleteTie = async (id: DocumentId) => {
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
    await wait(ties.remove(id))
  } catch (e) {
    await loadSource()
    await loadTies()
    await dialogs.error(e)
  }
}

const { dialogProps: editorProps } = useTieDialog()
</script>

<template>
  <Page>
    <div class="overflow-y-auto px-6 py-3">
      <div class="d-flex justify-center mb-5">
        <VHover v-slot="{ isHovering, props: hover }">
          <VDialog max-width="320">
            <template #default="{ isActive }">
              <FileUploadDialog
                v-model:visible="isActive.value"
                v-model="file"
                title="Source icon"
                accept="image/*"
                :icon="mdiCamera"
                :unset-icon="mdiVideoInputHdmi"
                :lazy-source="videoInputHdmiIcon"
                :show-confirm="t('action.save')"
                mandantory
                :show-cancel="t('action.discard')"
                @confirm="save" />
            </template>
            <template #activator="{ props: dialog }">
              <VAvatar id="replacableImage" size="128" v-bind="{ ...hover, ...dialog }">
                <VImg v-if="image != null" width="128" :src="image" :lazy-src="videoInputHdmiIcon" />
                <VIcon v-else :icon="mdiVideoInputHdmi" />
                <VOverlay
                  class="align-center justify-center text-center"
                  :model-value="isHovering ?? false"
                  theme="light"
                  scrim="primary-darken-4"
                  contained>
                  <VIcon :icon="mdiFileImagePlus" />
                  <div>Upload new image</div>
                </VOverlay>
              </VAvatar>
            </template>
          </VDialog>
        </VHover>
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
                  :prepend-icon="mdiExport"
                  class="mr-1"
                  size="x-small"
                  :text="String(entry.tie.outputChannels.video)"
                  label />
                <VChip
                  v-if="entry.tie.outputChannels.audio != null"
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

<style lang="scss" scoped>
#replacableImage {
  cursor: pointer;
}
</style>
