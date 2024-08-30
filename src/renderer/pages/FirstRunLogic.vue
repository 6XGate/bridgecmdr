<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNextTick } from '../helpers/vue'
import { useDialogs } from '../modals/dialogs'
import type { I18nSchema } from '../locales/locales'

const { t } = useI18n<I18nSchema>()
const dialogs = useDialogs()
const doneFirstRun = useLocalStorage<number>('doneFirstRun', 0)

const steps = [
  // v0: does nothing...
  async () => {
    await Promise.resolve()
  },
  // v1: Ask about auto-start file creation.
  async function () {
    if (await services.startup.checkEnabled()) return
    const yes = await dialogs.confirm(t('message.autoStartConfirm'))
    if (!yes) return

    try {
      await services.startup.enable()
    } catch (cause) {
      throw new Error(t('message.autoStartError'), { cause })
    }
  },
  // v2: Data migration warning.
  async () => {
    await dialogs.alert({
      title: t('label.v1Settings'),
      message: t('message.v1Settings'),
      button: t('action.understood'),
      color: 'red'
    })
  }
]

const doFirstRune = useNextTick(async function () {
  console.debug(`Done first steps: ${doneFirstRun.value}`)
  try {
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

onMounted(doFirstRune)
</script>

<template>
  <slot />
</template>

<i18n lang="yaml">
en:
  label:
    v1Settings: Old setting not migrated
  message:
    autoStartConfirm: Do you want BridgeCmdr to start on boot?
    autoStartError: Unable to create start-up entry
    v1Settings: |
      Due to unavoidable reasons, your data from v1.x cannot migrate to v2.x automatically.
      Your should export your version v1.x data and import it into v2.x.
      This should not be an issue in the future.
  action:
    understood: Got it
</i18n>
