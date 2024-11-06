import { useVuelidate } from '@vuelidate/core'
import { createI18nMessage, helpers } from '@vuelidate/validators'
import * as builtInRules from '@vuelidate/validators'
import { unref, computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { I18nSchema } from '../locales/locales'
import type {
  ValidationRuleWithoutParams,
  BaseValidation,
  GlobalConfig,
  ValidationArgs,
  ValidationRuleCollection
} from '@vuelidate/core'
import type { Ref, ToRefs } from 'vue'

export interface ValidationStatus {
  readonly errorMessages?: string | string[]
  readonly messages?: string | string[]
  readonly color?: string
}

interface ValidationCacheEntry {
  readonly status: ValidationStatus | undefined
  readonly class: string | undefined
}

type RuleCollection<T> = ValidationRuleCollection<T> | undefined

export function useValidation<
  SArgs extends unknown[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Matching Vuelidate.
  SRoot extends { [key in keyof VArgs]: any },
  VArgs extends ValidationArgs = ValidationArgs
>(
  validationsArgs: Ref<VArgs> | VArgs,
  state: SRoot | Ref<SRoot> | ToRefs<SRoot>,
  submit: (...args: SArgs) => unknown,
  globalConfig?: GlobalConfig
) {
  const config = { ...(globalConfig ?? {}) } satisfies GlobalConfig
  const v$ = unref(useVuelidate(validationsArgs, state, config))

  const cache = reactive(new Map<string, ValidationCacheEntry>())
  const ready = ref(false)

  const reset = () => {
    v$.$reset()
    ready.value = false
    cache.clear()
  }

  const touch = () => {
    v$.$touch()
    ready.value = true
    cache.clear()
  }

  function checkNestedDirty(validation: BaseValidation) {
    if (validation.$dirty) {
      return true
    }

    for (const [key, value] of Object.entries(validation)) {
      if (
        !key.startsWith('$') &&
        typeof value === 'object' &&
        value != null &&
        '$dirty' in value &&
        checkNestedDirty(value as BaseValidation)
      ) {
        return true
      }
    }

    return false
  }

  const dirty = computed(() => checkNestedDirty(v$))

  function getEntry<T, VRules extends RuleCollection<T>>(validator: BaseValidation<T, VRules>) {
    let entry = cache.get(validator.$path)
    if (entry != null) {
      return entry
    }

    entry =
      validator.$error && ready.value
        ? {
            status: {
              errorMessages: validator.$errors.map((error) => unref(error.$message)),
              color: 'error'
            },
            class: 'error--text'
          }
        : {
            status: undefined,
            class: undefined
          }

    cache.set(validator.$path, entry)

    return entry
  }

  function getMessages<T, VRules extends RuleCollection<T>>(validator: BaseValidation<T, VRules>) {
    return getEntry(validator).status?.errorMessages
  }

  function getClass<T, VRules extends RuleCollection<T>>(validator: BaseValidation<T, VRules>) {
    return getEntry(validator).class
  }

  function getColor<T, VRules extends RuleCollection<T>>(validator: BaseValidation<T, VRules>) {
    return getEntry(validator).status?.color
  }

  function getStatus<T, VRules extends RuleCollection<T>>(validator: BaseValidation<T, VRules>) {
    return getEntry(validator).status
  }

  async function handleCall(fn: () => unknown) {
    touch()

    const good = await v$.$validate()
    if (!good) {
      return
    }

    await fn()
  }

  function guardCall<Args extends unknown[]>(fn: (...args: Args) => unknown) {
    return async (...args: Args) => {
      await handleCall(() => fn(...args))
    }
  }

  return {
    dirty,
    getMessages,
    getClass,
    getColor,
    getStatus,
    handleCall,
    guardCall,
    submit: guardCall(submit),
    reset,
    v$
  }
}

export function useRules() {
  //
  // i18n
  //
  const { t } = useI18n<I18nSchema>()
  const withI18nMessage = createI18nMessage({ t })

  //
  // Built-in Vuelidate rules
  //
  const required = withI18nMessage(builtInRules.required)
  const requiredIf = withI18nMessage(builtInRules.requiredIf, { withArguments: true })
  const requiredUnless = withI18nMessage(builtInRules.requiredIf, { withArguments: true })

  const alpha = withI18nMessage(builtInRules.alpha)
  const alphaNum = withI18nMessage(builtInRules.alphaNum)
  const numeric = withI18nMessage(builtInRules.numeric)
  const integer = withI18nMessage(builtInRules.integer)
  const decimal = withI18nMessage(builtInRules.decimal)
  const email = withI18nMessage(builtInRules.email)
  const ipAddress = withI18nMessage(builtInRules.ipAddress)
  const url = withI18nMessage(builtInRules.url)

  const minLength = withI18nMessage(builtInRules.minLength, { withArguments: true })
  const maxLength = withI18nMessage(builtInRules.maxLength, { withArguments: true })
  const minValue = withI18nMessage(builtInRules.minValue, { withArguments: true })
  const maxValue = withI18nMessage(builtInRules.maxValue, { withArguments: true })
  const between = withI18nMessage(builtInRules.between, { withArguments: true })

  const { or, and, not } = builtInRules

  //
  // Custom rules
  //
  const uuid = withI18nMessage(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- Can't be help, not well typed.
    helpers.regex(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/u),
    { messagePath: () => 'validations.uuid' }
  ) as ValidationRuleWithoutParams

  return {
    // Built-in rules
    required,
    requiredIf: (...args: Parameters<typeof builtInRules.requiredIf>) => ({ requiredIf: requiredIf(...args) }),
    requiredUnless: (...args: Parameters<typeof builtInRules.requiredUnless>) => ({
      requiredUnless: requiredUnless(...args)
    }),
    alpha,
    alphaNum,
    numeric,
    integer,
    decimal,
    email,
    ipAddress,
    url,
    minLength: (...args: Parameters<typeof builtInRules.minLength>) => ({
      minLength: withI18nMessage(minLength(...args), { withArguments: true })
    }),
    maxLength: (...args: Parameters<typeof builtInRules.maxLength>) => ({
      maxLength: withI18nMessage(maxLength(...args), { withArguments: true })
    }),
    minValue: (...args: Parameters<typeof builtInRules.minValue>) => ({
      minValue: withI18nMessage(minValue(...args), { withArguments: true })
    }),
    maxValue: (...args: Parameters<typeof builtInRules.maxValue>) => ({
      maxValue: withI18nMessage(maxValue(...args), { withArguments: true })
    }),
    between: (...args: Parameters<typeof builtInRules.between>) => ({
      between: withI18nMessage(between(...args), { withArguments: true })
    }),
    or: (...args: Parameters<typeof builtInRules.or>) => ({ or: or(...args) }),
    and: (...args: Parameters<typeof builtInRules.and>) => ({ and: and(...args) }),
    not: (...args: Parameters<typeof builtInRules.not>) => ({ not: not(...args) }),
    // Our rules
    uuid
  }
}
