import { useVuelidate } from '@vuelidate/core'
import { createI18nMessage, helpers } from '@vuelidate/validators'
import * as builtInRules from '@vuelidate/validators'
import { unref, computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import type { I18nSchema } from '../locales/locales'
import type { Fixed } from '@/basics'
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

export const useValidation = <
  SArgs extends unknown[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Matching Vuelidate.
  SRoot extends { [key in keyof VArgs]: any },
  VArgs extends ValidationArgs = ValidationArgs
>(
  validationsArgs: Ref<VArgs> | VArgs,
  state: SRoot | Ref<SRoot> | ToRefs<SRoot>,
  submit: (...args: SArgs) => unknown,
  globalConfig?: GlobalConfig
) => {
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

  const checkNestedDirty = (validation: BaseValidation) => {
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

  const getEntry = <T, VRules extends RuleCollection<T>>(validator: BaseValidation<T, VRules>) => {
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

  const getMessages = <T, VRules extends RuleCollection<T>>(validator: BaseValidation<T, VRules>) =>
    getEntry(validator).status?.errorMessages

  const getClass = <T, VRules extends RuleCollection<T>>(validator: BaseValidation<T, VRules>) =>
    getEntry(validator).class

  const getColor = <T, VRules extends RuleCollection<T>>(validator: BaseValidation<T, VRules>) =>
    getEntry(validator).status?.color

  const getStatus = <T, VRules extends RuleCollection<T>>(validator: BaseValidation<T, VRules>) =>
    getEntry(validator).status

  const handleCall = async (fn: () => unknown) => {
    touch()

    const good = await v$.$validate()
    if (!good) {
      return
    }

    await fn()
  }

  const guardCall =
    <Args extends unknown[]>(fn: (...args: Args) => unknown) =>
    async (...args: Args) => {
      await handleCall(() => fn(...args))
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

export const useRules = () => {
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

/*
  Is it a valid hostname?

  From RFC-952 (with relaxation stated in RFC-1123 2.1)

  Hostname is <hname>
  <hname> = <name>*["."<name>]
  <name> = <let-or-digit>[*[<let-or-digit-or-hyphen]<let-or-digit]

  So, the regular expression would be,
  <name> = /[\p{N}\p{L}](?:[\p{N}\p{L}-]*[\p{N}\p{L}])?/gu
  <hname> /^<name>(?:\.<name>)*$/gu

  Fully rendered in hostNamePattern, with non-capture groups
  to capturing converted for better readibility.
*/

const kHostNamePattern = /^[\p{N}\p{L}]([\p{N}\p{L}-]*[\p{N}\p{L}])?(\.[\p{N}\p{L}]([\p{N}\p{L}-]*[\p{N}\p{L}])?)*$/u
export const isHostName = (value: string) => kHostNamePattern.test(value)
const zodHostname = z.string().regex(kHostNamePattern)
export { zodHostname as hostname }

/*
  Zod's IP pattern allows some invalid address strings, suchs as double-zero, `00`.
  These days IPv4 is generally always in decimal, not octal. It seems Zod was
  aiming for this. With this in mind, the definition is as follows.

  <address> = <octet> 3 * ("." <octet>)
  <octet> = /(25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([1-9][0-9])|[0-9]/ # 0 - 255
*/

const kIpV4Pattern =
  /^((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([1-9][0-9])|[0-9])(\.((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([1-9][0-9])|[0-9])){3}$/u
export const isIpV4Address = (value: string): value is `${number}.${number}.${number}.${number}` =>
  kIpV4Pattern.test(value)
const zodIpV4Address = z.string().regex(kIpV4Pattern)
export { zodIpV4Address as ipV4Address }

/*
  Zod's IPv6 pattern allows a lot of invalid and misses some valid addresses.
  See https://github.com/colinhacks/zod/issues/2339.
  The RFCs seems indicate the following battern.

  IPv6
    <six-address> | <four-address>

    <six-address> = <full-address> | <compact-address>
    <four-address> = <full-address-prefix> <four-address> | <compact-address-prefix> <four-address>

    <full-address> = <ip6-octet-pair> (7 * (":" <ip6-octet-pair>))
    <compact-address> = "::" # Zero address
                      | ":" 7 * (":" <ip6-octet-pair>)
                      | <ip6-octet-pair> ":" 1-6 * (":" <ip6-octet-pair>)
                      | 1-2 * (<ip6-octet-pair> ":") 1-5 * (":" <ip6-octet-pair>)
                      | 1-3 * (<ip6-octet-pair> ":") 1-4 * (":" <ip6-octet-pair>)
                      | 1-4 * (<ip6-octet-pair> ":") 1-3 * (":" <ip6-octet-pair>)
                      | 1-5 * (<ip6-octet-pair> ":") 1-2 * (":" <ip6-octet-pair>)
                      | 1-6 * (<ip6-octet-pair> ":") ":" <ip6-octet-pair>
                      | 7 * (<ip6-octet-pair> ":") ":"

    <ip6-octet-pair> = /[0-9A-Fa-f]{1,3}/ | /[0-9A-F]{1,3}/i | /[0-9a-f]{1,3}/i

    <full-address-prefix> = <ip6-octet-pair> (5 * (":" <ip6-octet-pair>))

    <compact-address-prefix> = "::" # Zero prefix
                                 | ":" 5 * (":" <ip6-octet-pair>) ":"
                                 | <ip6-octet-pair> ":" 1-4 * (":" <ip6-octet-pair>) ":"
                                 | 1-2 * (<ip6-octet-pair> ":") 1-3 * (":" <ip6-octet-pair>) ":"
                                 | 1-3 * (<ip6-octet-pair> ":") 1-2 * (":" <ip6-octet-pair>) ":"
                                 | 1-4 * (<ip6-octet-pair> ":") ":" <ip6-octet-pair> ":"
                                 | 5 * (<ip6-octet-pair> ":") ":"

    <four-address> = <ip4-octet> (3 * ("." <ip4-octet>))

    <ip4-octet> = /(25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([1-9][0-9])|[0-9]/ # 0 - 255
*/

const kIpPair = /^[0-9A-Fa-f]{1,4}$/u

const parsePossibleIpString = (value: string) => {
  // Split on the ':', results in some empty strings with compact.
  const parts = value.split(':')

  // Trim if leading empty string, leading zeros in compact.
  if (parts[0] === '') {
    parts.shift()
  }

  // Trim if trailing empty string, trailing zeros in compact.
  if (parts[parts.length - 1] === '') {
    parts.pop()
  }

  // Split if compact. Will only preduce one or two results.
  const sep = parts.indexOf('')
  if (sep >= 0) {
    // We add a zero to the second array to simply compact form logic.
    // This is because the extra zero can stand for the at least one
    // missing pair in the compact form.
    return [parts.slice(0, sep), ['0', ...parts.slice(sep + 1)]] satisfies Fixed
  }

  return [parts] satisfies Fixed
}

const isValidFullIpV6 = (value: string[]) => {
  const last = value.pop()

  // IPv4 translation.
  if (kIpV4Pattern.test(last ?? '')) {
    return value.length === 6 && value.every((p) => kIpPair.test(p))
  }

  // IPv6, only 7 since we pop'ped the last.
  return value.length === 7 && value.every((p) => kIpPair.test(p)) && kIpPair.test(last ?? '')
}

const isValidCompactIpV6 = ([left, right]: [string[], string[]]) => {
  // Undefind if right is empty.
  const last = right.pop()

  // IPv4 translation, won't test on an empty right.
  if (kIpV4Pattern.test(last ?? '')) {
    return left.length + right.length <= 6 && left.every((p) => kIpPair.test(p)) && right.every((p) => kIpPair.test(p))
  }

  // IPv6, only 7 since we pop'ed the last.
  // Empty arrays won't have anything to
  // test and are valid as zero leading.
  return (
    left.length + right.length <= 7 &&
    left.every((p) => kIpPair.test(p)) &&
    right.every((p) => kIpPair.test(p)) &&
    kIpPair.test(last ?? '')
  )
}

export const isIpV6Address = (value: string) => {
  if (value === '::') {
    // Zero address short-circuit.
    return true
  }

  const parts = parsePossibleIpString(value)
  if (parts.length === 1) {
    return isValidFullIpV6(parts[0])
  }

  return isValidCompactIpV6(parts)
}

const zodIpV6Address = z.string().refine(isIpV6Address)
export { zodIpV6Address as ipV6Address }

export const isHost = (value: string) => isHostName(value) || isIpV4Address(value) || isIpV6Address(value)

const zodHost = z.string().refine(isHost)
export { zodHost as host }

const kHostWithOptionalPort = /^((?:\[[A-Fa-f0-9.:]+\])|(?:[\p{N}\p{L}.-]+))(?::([1-9][0-9]*))?$/u

export const zodParseHostWithOptionalPort = (value: string) => {
  const match = kHostWithOptionalPort.exec(value)

  if (match == null) {
    return undefined
  }

  if (match[1]?.startsWith('[') === true) {
    match[1] = match[1].slice(1, -1)
    // substring(1, -1)
  }

  const host = zodHost.safeParse(match[1])
  const port = z.coerce.number().positive().int().optional().safeParse(match[2])

  return [host, port] satisfies Fixed
}

export const parseHostWithOptionalPort = (value: string) => {
  const result = zodParseHostWithOptionalPort(value)
  if (result == null) {
    return undefined
  }

  const [host, port] = result
  if (!host.success) {
    return undefined
  }

  if (!port.success || port.data == null) {
    return [host.data] satisfies Fixed
  }

  return [host.data, port.data] satisfies Fixed
}

export const isHostWithOptionalPort = (value: string) => {
  const result = zodParseHostWithOptionalPort(value)

  return result?.[0].success === true && result[1].success
}

const zodHostWithOptionalPort = z.string().transform((value, ctx) => {
  const result = parseHostWithOptionalPort(value)
  if (result == null) {
    ctx.addIssue({
      message: 'Not a valid host or host:port combination',
      code: 'invalid_string',
      validation: 'regex',
      fatal: true
    })

    return z.NEVER
  }

  return result
})

export { zodHostWithOptionalPort as hostWithOptionalPort }

// More Zod
export const mz = {
  hostname: zodHostname,
  ipV4Address: zodIpV4Address,
  ipV6Address: zodIpV6Address,
  host: zodHost,
  hostWithOptionalPort: zodHostWithOptionalPort
}
