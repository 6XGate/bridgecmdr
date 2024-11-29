import { helpers } from '@vuelidate/validators'
import { toValue, computed, readonly } from 'vue'
import { useI18n } from 'vue-i18n'
import type { I18nSchema } from '../locales/locales'
import type { PortEntry } from '../services/ports'
import type { LocationType } from '@/location'
import type { MessageProps } from '@vuelidate/validators'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { isValidLocation } from '@/location'

export function useLocationUtils(validPorts: MaybeRefOrGetter<readonly PortEntry[]>) {
  const { t } = useI18n<I18nSchema>()

  function locMsg({ $model }: MessageProps) {
    const path = String($model)
    switch (true) {
      case path.startsWith('port:'):
        return t('validations.location.port')
      case path.startsWith('ip:'):
        return t('validations.location.ip')
      default:
        return t('validations.location.invalid')
    }
  }

  const locationPath = helpers.withMessage(
    locMsg,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Can't be help, not well typed.
    (value: unknown) => !(helpers.req(value) as boolean) || isValidLocation(String(value), toValue(validPorts))
  )

  return {
    locationPath
  }
}

interface LocationTypeMetaData {
  title: string
  value: LocationType
}

export default function useLocation(
  location: Ref<string | undefined>,
  validPorts: MaybeRefOrGetter<readonly PortEntry[]>
) {
  const { t } = useI18n<I18nSchema>()
  const { locationPath } = useLocationUtils(validPorts)

  const pathTypes = readonly([
    { title: t('label.remote'), value: 'ip' },
    { title: t('label.port'), value: 'port' }
  ] satisfies LocationTypeMetaData[])

  const pathType = computed({
    get: () => {
      switch (true) {
        case location.value?.startsWith('port:'):
          return 'port'
        case location.value?.startsWith('ip:'):
          return 'ip'
        default:
          return undefined
      }
    },
    set: (value) => {
      location.value = value != null ? (location.value = `${value}:${path.value}`) : undefined
    }
  })

  const pathLabel = computed(() => {
    switch (true) {
      case pathType.value === 'port':
        return t('label.port')
      case pathType.value === 'ip':
        return t('label.remote')
      default:
        return undefined
    }
  })

  const path = computed({
    get: () => {
      switch (pathType.value) {
        case 'port':
          return location.value?.substring(5)
        case 'ip':
          return location.value?.substring(3)
        default:
          return undefined
      }
    },
    set: (value) => {
      location.value = pathType.value != null ? (location.value = `${pathType.value}:${value}`) : undefined
    }
  })

  return {
    locationPath,
    pathTypes,
    pathType,
    pathLabel,
    path
  }
}
