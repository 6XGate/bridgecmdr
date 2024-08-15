import { useLocalStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { asyncForEach } from '../helpers/utilities'
import { useDialogs } from '../modals/dialogs'
import type { I18nSchema } from '../locales/locales'

const useFirstRun = () => {
  const { t } = useI18n<I18nSchema>()
  const dialogs = useDialogs()
  const doneFirstRun = useLocalStorage<number>('doneFirstRun', 0)

  const steps = [
    // Version/step 0: does nothing...
    async () => await Promise.resolve(true),
    // Version/step 1: Ask about auto-start file creation.
    async () => {
      if (await services.startup.checkEnabled()) {
        return true
      }

      const yes = await dialogs.confirm(t('message.autoStartConfirm'))
      if (!yes) {
        return true
      }

      try {
        await services.startup.enable()

        return true
      } catch (e) {
        await dialogs.error(e, 'Unable to create start-up entry')

        return false
      }
    },
    // Version/step 2: Data migration warning.
    async () => {
      await dialogs.alert({
        title: 'Old setting not migrated',
        message: `Due to the architecture of version 1.x, your old data cannot be migrated to 2.x.
                  Your data is still there and you can run version 1.x to write it down and put
                  it in version 2.x if necessary. This will not be an issue moving forward.`,
        button: 'Got it',
        color: 'red'
      })

      return true
    }
  ]

  const doFirstRun = async () => {
    await asyncForEach(steps, async (step, index) => {
      if (doneFirstRun.value >= index) {
        return true
      }

      try {
        const done = await step()
        if (!done) {
          return false
        }

        doneFirstRun.value = index
      } catch (e) {
        await dialogs.error(e)

        return false
      }

      return true
    })
  }

  return {
    doneFirstRun,
    doFirstRun
  }
}

export default useFirstRun
