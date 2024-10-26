import { helpers } from '@vuelidate/validators'
import { toValue } from '@vueuse/shared'
import { computed, readonly } from 'vue'
import { useI18n } from 'vue-i18n'
import { isHostWithOptionalPort } from './validation'
import type { I18nSchema } from '../locales/locales'
import type { PortData } from '../system/ports'
import type { NewSwitch } from '../system/switch'
import type { Fixed } from '@/basics'
import type { MessageProps } from '@vuelidate/validators'
import type { MaybeRefOrGetter } from '@vueuse/shared'
import type { Ref } from 'vue'

export type PathType = 'port' | 'ip' | 'path'

export function useLocationUtils(validSwitches: MaybeRefOrGetter<readonly PortData[]>) {
  const { t } = useI18n<I18nSchema>()

  // TODO: Proper checks.
  function isPath(value: string) {
    switch (true) {
      case value.startsWith('port:'):
        return toValue(validSwitches).find((port) => port.value === value.substring(5)) != null
      case value.startsWith('ip:'):
        return isHostWithOptionalPort(value.substring(3))
      default:
        return true // Check if it's a valid path??
    }
  }

  function locMsg({ $model }: MessageProps) {
    const path = String($model)
    switch (true) {
      case path.startsWith('port:'):
        return t('validations.location.port')
      case path.startsWith('ip:'):
        return t('validations.location.ip')
      default:
        return t('validations.location.path')
    }
  }

  const locationPath = helpers.withMessage(
    locMsg,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Can't be help, not well typed.
    (value: unknown) => !(helpers.req(value) as boolean) || isPath(String(value))
  )

  function splitPath(value: string | undefined) {
    if (value == null) {
      return undefined
    }

    switch (true) {
      case value.startsWith('port:'):
        return ['port' as const, value.substring(5)] satisfies Fixed
      case value.startsWith('ip:'):
        return ['ip' as const, value.substring(3)] satisfies Fixed
      default:
        return ['path' as const, value] satisfies Fixed
    }
  }

  return {
    locationPath,
    splitPath
  }
}

interface LocationTypeMetaData {
  title: string
  value: PathType
}

export function useLocation(location: Ref<string>, validSwitches: MaybeRefOrGetter<readonly PortData[]>) {
  const { t } = useI18n<I18nSchema>()
  const { locationPath, splitPath } = useLocationUtils(validSwitches)

  const pathTypes = readonly([
    { title: t('label.path'), value: 'path' },
    { title: t('label.remote'), value: 'ip' },
    { title: t('label.port'), value: 'port' }
  ] satisfies LocationTypeMetaData[])

  const pathType = computed({
    get: () => {
      switch (true) {
        case location.value.startsWith('port:'):
          return 'port'
        case location.value.startsWith('ip:'):
          return 'ip'
        default:
          return 'path'
      }
    },
    set: (value) => {
      location.value = value !== 'path' ? (location.value = `${value}:${path.value}`) : (location.value = path.value)
    }
  })

  const pathLabel = computed(() => {
    switch (true) {
      case pathType.value === 'port':
        return t('label.port')
      case pathType.value === 'ip':
        return t('label.remote')
      default:
        return t('label.path')
    }
  })

  const path = computed({
    get: () => {
      switch (pathType.value) {
        case 'port':
          return location.value.substring(5)
        case 'ip':
          return location.value.substring(3)
        default:
          return location.value
      }
    },
    set: (value) => {
      location.value =
        pathType.value !== 'path' ? (location.value = `${pathType.value}:${value}`) : (location.value = value)
    }
  })

  return {
    locationPath,
    splitPath,
    pathTypes,
    pathType,
    pathLabel,
    path
  }
}

export const useSwitchLocation = (
  switcher: MaybeRefOrGetter<NewSwitch>,
  validSwitches: MaybeRefOrGetter<readonly PortData[]>
) => {
  const location = computed({
    get: () => toValue(switcher).path,
    set: (v) => {
      toValue(switcher).path = v
    }
  })

  return {
    location,
    ...useLocation(location, validSwitches)
  }
}
