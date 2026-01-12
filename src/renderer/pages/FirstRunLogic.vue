<script setup lang="ts">
import { useAsyncState, useLocalStorage, watchOnce } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { trackBusy } from '../hooks/tracking'
import { useDialogs } from '../modals/dialogs'
import useMigration from '../services/migration'
import { useClient } from '../services/rpc/trpc'
import useStartup from '../services/startup'
import type { I18nSchema } from '../locales/locales'

const { t } = useI18n<I18nSchema>()
const { wait, isBusy } = trackBusy()
const dialogs = useDialogs()
const doneFirstRun = useLocalStorage<number>('doneFirstRun', 0)

const { state: appInfo, isReady } = useAsyncState(async () => await useClient().appInfo.query(), {
  name: 'Loading...',
  version: 'Loading...'
})

const startup = useStartup()
const migrate = useMigration()

const steps = [
  // v0: does nothing...
  async () => {
    await Promise.resolve()
  },
  // v1: Ask about auto-start file creation.
  async function () {
    if (await wait(startup.checkEnabled())) return
    const yes = await dialogs.confirm(t('message.autoStartConfirm', [appInfo.value.name]))
    if (!yes) return

    try {
      await wait(startup.enable())
    } catch (cause) {
      throw new Error(t('message.autoStartError'), { cause })
    }
  },
  // v2: Data migration from v1 warning. Removed in v2.3.0.
  async () => {
    await Promise.resolve()
  }
]

watchOnce(isReady, async function doFirstRun() {
  console.debug(`Done first steps: ${doneFirstRun.value}`)
  try {
    // Check if the entry needs to be updated.
    await startup.checkUp()

    // Always "run" migrations, this just checks
    // what the status was when run at startup.
    await migrate()

    /* eslint-disable no-await-in-loop */
    for (const [index, step] of steps.entries()) {
      if (doneFirstRun.value >= index) {
        continue
      }

      console.debug(`Doing first run step: ${index}`)
      await step()

      doneFirstRun.value = index
    }
    /* eslint-enable no-await-in-loop */
  } catch (cause) {
    await dialogs.error(cause)
  }
})
</script>

<template>
  <VOverlay :model-value="isBusy">
    <VProgressCircular indeterminate />
  </VOverlay>
  <slot />
</template>

<i18n lang="yaml">
en:
  label:
    v1Settings: Old setting not migrated
  message:
    autoStartConfirm: Do you want {0} to start on boot?
    autoStartError: Unable to create start-up entry
</i18n>
