import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import type { I18nSchema } from '@/locales/locales'
import type { Store } from 'pinia'

export const useErrors = () => {
  const { t } = useI18n<I18nSchema>()

  const toError = (e: unknown) =>
    (e instanceof Error
      ? e
      : new Error(String(e)))

  const toPath = (path: Array<number | string>) => path
    .map(segment => (typeof segment === 'number' ? `[${segment}]` : segment))
    .reduce((p, c) => (c.startsWith('[') ? `${p}${c}` : `${p}.${c}`))

  const toMessage = (e: unknown) => {
    if (!(e instanceof Error)) {
      return String(e)
    }

    if (e instanceof z.ZodError) {
      const flattened = e.flatten(issue =>
        (issue.path.length > 0
          ? `${toPath(issue.path)}: ${issue.message}`
          : issue.message))

      return flattened.formErrors[0] ??
        // Map all fields to their first error, and find the first that has an error.
        Object.values(flattened.fieldErrors).map(errors => errors?.[0]).find(error => error != null) ??
        t('error.zod')
    }

    return e.message
  }

  return {
    toError,
    toMessage,
    raiseNoActiveCurrentError
  }
}

type StoreTypes = 'switch' | 'source' | 'tie'
export function raiseNoActiveCurrentError (type: StoreTypes, store: Store): never {
  throw new ReferenceError(`No active ${type}; there must be an active source (${store.$id}.current != null)`)
}
