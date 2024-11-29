<script setup lang="ts">
import { mdiArrowLeft, mdiDelete, mdiPlus, mdiMonitor, mdiVideoSwitch } from '@mdi/js'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Page from '../components/Page.vue'
import { useGuardedAsyncOp } from '../hooks/utilities'
import DeviceDialog from '../modals/DeviceDialog.vue'
import { useDialogs, useDeviceDialog } from '../modals/dialogs'
import { useDevices } from '../services/data/devices'
import useDrivers from '../services/driver'
import type { I18nSchema } from '../locales/locales'
import type { NewDevice, Device } from '../services/data/devices'
import type { DriverInformation } from '../services/driver'
import type { DeepReadonly } from 'vue'
import { isNotNullish } from '@/basics'

const router = useRouter()

const dialogs = useDialogs()

const { t } = useI18n<I18nSchema>()

interface Item {
  device: DeepReadonly<Device>
  driver: DriverInformation
}

const devices = useDevices()
const drivers = useDrivers()
const items = computed(() =>
  devices.items
    .map((device) => {
      const driver = drivers.items.find((d) => d.guid === device.driverId)

      return driver != null ? ({ device, driver } satisfies Item) : undefined
    })
    .filter(isNotNullish)
)

const refresh = useGuardedAsyncOp(async () => {
  // TODO: await drivers.all(), with busy tracking
  await devices.all()
})

onMounted(refresh)

async function addDevice(target: NewDevice) {
  try {
    await devices.add(target)
  } catch (e) {
    await dialogs.error(e)
    await refresh()
  }
}

async function updateDevice(target: Device, changes: NewDevice) {
  try {
    await devices.update({ ...target, ...changes })
  } catch (e) {
    await refresh()
    await dialogs.error(e)
  }
}

async function deleteDevice(item: Item) {
  const kind = item.driver.kind === 'monitor' ? t('label.monitor') : t('label.switch')

  const yes = await dialogs.confirm({
    title: t('message.confirmDeleteDevice', [kind]),
    message: t('message.deleteDeviceWarning'),
    confirmButton: t('action.delete'),
    cancelButton: t('action.keep'),
    color: 'error'
  })

  if (!yes) {
    return
  }

  try {
    await devices.remove(item.device._id)
  } catch (e) {
    await refresh()
    await dialogs.error(e)
  }
}

const { dialogProps: editorProps } = useDeviceDialog()
</script>

<template>
  <Page v-slot="{ toolbar, scrolled }">
    <VToolbar v-bind="toolbar" :title="t('label.switchesAndMonitors')">
      <template #prepend><VBtn :icon="mdiArrowLeft" @click="router.back" /></template>
    </VToolbar>
    <VProgressLinear v-show="devices.isBusy" indeterminate />
    <VList v-scroll.self="scrolled" :disabled="devices.isBusy" bg-color="transparent">
      <template v-for="(item, index) of items" :key="item.device._id">
        <VDivider v-if="index > 0" class="mx-4" />
        <VDialog v-bind="editorProps">
          <template #default="{ isActive }">
            <DeviceDialog
              v-model:visible="isActive.value"
              :device="item.device"
              editing
              @confirm="(v) => updateDevice(item.device, v)" />
          </template>
          <template #activator="{ props: dialog }">
            <VListItem v-bind="dialog" :title="item.device.title" :subtitle="item.driver.title">
              <template #prepend>
                <VAvatar :icon="item.driver.kind === 'monitor' ? mdiMonitor : mdiVideoSwitch" />
              </template>
              <template #append>
                <VTooltip :text="t('action.delete')">
                  <template #activator="{ props: tooltip }">
                    <VBtn v-bind="tooltip" :icon="mdiDelete" variant="text" @click.prevent.stop="deleteDevice(item)" />
                  </template>
                </VTooltip>
              </template>
            </VListItem>
          </template>
        </VDialog>
      </template>
    </VList>
    <VSheet class="ma-6" color="transparent" location="bottom right" position="fixed">
      <VTooltip :text="t('action.addDevice')">
        <template #activator="{ props }">
          <VDialog v-bind="editorProps">
            <template #default="{ isActive }">
              <DeviceDialog
                v-model:visible="isActive.value"
                :device="devices.blank()"
                :editing="false"
                @confirm="addDevice" />
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
    addDevice: New switch or monitor
  message:
    confirmDeleteDevice: Do you want to remove this {0}?
    deleteDeviceWarning: This will also remove any tie relationships on sources.
  label:
    monitor: monitor
    switch: switch
</i18n>
