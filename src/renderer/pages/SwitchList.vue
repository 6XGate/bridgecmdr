<script setup lang="ts">
import { mdiArrowLeft, mdiDelete, mdiPlus, mdiVideoSwitch } from '@mdi/js'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Page from '../components/Page.vue'
import { useGuardedAsyncOp } from '../helpers/utilities'
import SwitchDialog from '../modals/SwitchDialog.vue'
import { useDialogs, useSwitchDialog } from '../modals/dialogs'
import { useDrivers } from '../services/driver'
import { useSwitches } from '../services/switches'
import type { I18nSchema } from '../locales/locales'
import type { DriverInformation } from '../services/driver'
import type { DocumentId } from '../services/store'
import type { NewSwitch, Switch } from '../services/switches'
import type { DeepReadonly } from 'vue'
import { isNotNullish } from '@/basics'

const router = useRouter()

const dialogs = useDialogs()

const { t } = useI18n<I18nSchema>()

interface Item {
  switch: DeepReadonly<Switch>
  driver: DriverInformation
}

const switches = useSwitches()
const drivers = useDrivers()
const items = computed(() =>
  switches.items
    .map((item) => {
      const driver = drivers.items.find((d) => d.guid === item.driverId)

      return driver != null ? ({ switch: item, driver } satisfies Item) : undefined
    })
    .filter(isNotNullish)
)

const refresh = useGuardedAsyncOp(async () => {
  await switches.all()
})

onMounted(refresh)

async function addSwitch(target: NewSwitch) {
  try {
    await switches.add(target)
  } catch (e) {
    await dialogs.error(e)
    await refresh()
  }
}

async function updateSwitch(target: DeepReadonly<Switch>, changes: NewSwitch) {
  try {
    await switches.update({ ...target, ...changes })
  } catch (e) {
    await refresh()
    await dialogs.error(e)
  }
}

async function deleteSwitch(id: DocumentId) {
  const yes = await dialogs.confirm({
    title: t('message.confirmDeleteSwitch'),
    message: t('message.deleteSwitchWarning'),
    confirmButton: t('action.delete'),
    cancelButton: t('action.keep'),
    color: 'error'
  })

  if (!yes) {
    return
  }

  try {
    await switches.remove(id)
  } catch (e) {
    await refresh()
    await dialogs.error(e)
  }
}

const { dialogProps: editorProps } = useSwitchDialog()
</script>

<template>
  <Page v-slot="{ toolbar, scrolled }">
    <VToolbar v-bind="toolbar" :title="t('label.switches')">
      <template #prepend><VBtn :icon="mdiArrowLeft" @click="router.back" /></template>
    </VToolbar>
    <VProgressLinear v-show="switches.isBusy" indeterminate />
    <VList v-scroll.self="scrolled" :disabled="switches.isBusy" bg-color="transparent">
      <template v-for="(item, index) of items" :key="item.switch._id">
        <VDivider v-if="index > 0" class="mx-4" />
        <VDialog v-bind="editorProps">
          <template #default="{ isActive }">
            <SwitchDialog
              v-model:visible="isActive.value"
              :switch="item.switch"
              editing
              @confirm="(v) => updateSwitch(item.switch, v)" />
          </template>
          <template #activator="{ props: dailog }">
            <VListItem v-bind="dailog" :title="item.switch.title" :subtitle="item.driver.title">
              <template #prepend>
                <VAvatar :icon="mdiVideoSwitch" />
              </template>
              <template #append>
                <VTooltip :text="t('action.delete')">
                  <template #activator="{ props: tooltip }">
                    <VBtn
                      v-bind="tooltip"
                      :icon="mdiDelete"
                      variant="text"
                      @click.prevent.stop="deleteSwitch(item.switch._id)" />
                  </template>
                </VTooltip>
              </template>
            </VListItem>
          </template>
        </VDialog>
      </template>
    </VList>
    <VSheet class="ma-6" color="transparent" location="bottom right" position="fixed">
      <VTooltip :text="t('action.addSwitch')">
        <template #activator="{ props }">
          <VDialog v-bind="editorProps">
            <template #default="{ isActive }">
              <SwitchDialog
                v-model:visible="isActive.value"
                :switch="switches.blank()"
                :editing="false"
                @confirm="addSwitch" />
            </template>
            <template #activator="{ props: dialog }">
              <VBtn v-bind="{ ...props, ...dialog }" class="ml-6" :icon="mdiPlus" color="primary" />
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
    addSwitch: New switch
  message:
    confirmDeleteSwitch: Do you want to remove this switch?
    deleteSwitchWarning: This will also remove any tie relationships on sources.
</i18n>
