<script setup lang="ts">
import { mdiPower, mdiVideoInputHdmi, mdiWrench } from '@mdi/js'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VBtn } from 'vuetify/components'
import { useGuardedAsyncOp } from '../hooks/utilities'
import { useDialogs } from '../modals/dialogs'
import { useDashboard } from '../services/dashboard'
import { useClient } from '../services/rpc/trpc'
import useSettings from '../services/settings'
import FirstRunLogic from './FirstRunLogic.vue'
import type { I18nSchema } from '../locales/locales'
import type { Button } from '../services/dashboard'

const settings = useSettings()
const buttonSize = computed(() => settings.iconSize + 12)
const iconSize = computed(() => settings.iconSize)

const { t } = useI18n<I18nSchema>()

const powerTooltip = computed(() =>
  settings.powerOffWhen === 'double' ? t('tooltip.doubleTapPowerOff') : t('tooltip.powerOff')
)

const dialogs = useDialogs()

const dashboard = useDashboard()

const client = useClient()

async function powerOff() {
  try {
    await dashboard.powerOff()
    await client.system.powerOff.mutate()
  } catch (e) {
    await dialogs.error(e)
  }

  globalThis.close()
}

const powerButtonProps = computed(() =>
  settings.powerOffWhen === 'double' ? { onDblclick: powerOff } : { onClick: powerOff }
)

/** Element to act as the drag-drop shadow image. */
const dragShadow = ref<VBtn | null>(null)
/** Currently dragged button. */
const dragged = ref<Button>()
/** Current drop position being hovered over. */
const dropPosition = ref<number>()

function dragStart(event: DragEvent, button: Button) {
  dragged.value = button
  if (!(dragShadow.value?.$el instanceof HTMLElement)) return
  event.dataTransfer?.setDragImage(dragShadow.value.$el, event.offsetX, event.offsetY)
}

function dragOver(event: DragEvent, target: number) {
  dropPosition.value = target
  event.preventDefault()
  if (event.dataTransfer != null) {
    event.dataTransfer.effectAllowed = 'all'
    event.dataTransfer.dropEffect = 'move'
  }
}

function dragLeave() {
  dropPosition.value = undefined
}

function dragDrop(index: number) {
  dropPosition.value = undefined
  if (dragged.value == null) return
  const button = dashboard.items[index]
  if (button == null) return
  const next = dashboard.items[index + 1]
  if (next == null) {
    // Last item, so just use a delta of 1.
    dragged.value.setOrder(button.order + 1)
    return
  }

  // Fine the delta between the button.
  const delta = (next.order - button.order) / 2
  dragged.value.setOrder(button.order + delta)
}

onMounted(
  useGuardedAsyncOp(async () => {
    await dashboard.refresh()
    // HACK: Setup the first button as the dragged shadow
    // so the drag image is mostly ready to go.
    dragged.value = dashboard.items[0]
  })
)
</script>

<template>
  <VMain scrollable>
    <FirstRunLogic />
    <VContainer class="d-flex flex-wrap gr-4">
      <div v-if="dashboard.isBusy" class="align-center d-flex justify-center">
        <VProgressCircular size="256px" indeterminate />
      </div>
      <!-- Drag-drop shadow -->
      <template v-if="dragged != null">
        <VBtn
          ref="dragShadow"
          :class="$style.dragShadow"
          :width="buttonSize"
          :height="buttonSize"
          variant="flat"
          rounded="lg">
          <VIcon v-if="dragged?.image == null" :icon="mdiVideoInputHdmi" :size="settings.iconSize" />
          <img v-else :src="dragged.image" :width="iconSize" :height="iconSize" />
        </VBtn>
        <VSheet :class="$style.dragCover" :width="buttonSize" :height="buttonSize" />
      </template>
      <template v-for="(button, index) of dashboard.items" :key="`button-${index}`">
        <VTooltip :text="button.title" location="bottom">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              :width="buttonSize"
              :height="buttonSize"
              variant="flat"
              rounded="lg"
              :active="button.isActive"
              draggable="true"
              @dragstart="dragStart($event, button)"
              @dragend="dragLeave"
              @click="button.activate">
              <VIcon v-if="button.image == null" :icon="mdiVideoInputHdmi" :size="settings.iconSize" />
              <VImg v-else :src="button.image" :width="iconSize" :height="iconSize" draggable="false" />
            </VBtn>
            <!-- Insertion markers -->
            <VSheet
              color="transparent"
              width="16"
              class="align-center d-flex justify-center"
              @dragover="dragOver($event, index)"
              @dragleave="dragLeave"
              @drop="dragDrop(index)">
              <VSheet
                :class="$style.eventsNone"
                width="4"
                :height="buttonSize - 12"
                :color="dropPosition === index ? 'white' : 'transparent'"></VSheet>
            </VSheet>
          </template>
        </VTooltip>
      </template>
      <VSheet color="transparent" class="ma-6" location="bottom right" position="fixed">
        <VTooltip :text="powerTooltip">
          <template #activator="{ props }">
            <VBtn v-bind="{ ...props, ...powerButtonProps }" :icon="mdiPower" class="ml-3" color="error" />
          </template>
        </VTooltip>
        <VTooltip :text="t('tooltip.openSettings')" left>
          <template #activator="{ props }">
            <VBtn v-bind="props" :icon="mdiWrench" class="ml-3" color="secondary" :to="{ name: 'settings' }" />
          </template>
        </VTooltip>
      </VSheet>
    </VContainer>
  </VMain>
</template>

<style lang="scss" module>
.eventsNone {
  pointer-events: none;
}
.dragCover {
  position: fixed;
  background: rgb(var(--v-theme-background));
}
.dragShadow {
  position: fixed;
}
</style>

<i18n lang="yaml">
en:
  tooltip:
    powerOff: Power off
    doubleTapPowerOff: Power off (double-click)
    openSettings: Open settings
</i18n>
