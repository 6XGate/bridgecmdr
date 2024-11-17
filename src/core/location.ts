import { z } from 'zod'
import type { Fixed } from './basics'
import type { PortInfo } from '../main/services/ports'

export type LocationType = 'port' | 'ip'

/** Determines if a value is a serial port or simplify has the `ip:` prefix. */
export function isIpOrValidPort(value: string, ports: readonly PortInfo[]) {
  switch (true) {
    case value.startsWith('port:'):
      return ports.find((port) => port.path === value.substring(5)) != null
    case value.startsWith('ip:') && value[3] !== '/' && !value.slice(3).startsWith('file:') && value.length > 3:
      return true
    default:
      return false
  }
}

/** Determines if a value is a serial port or IP address format. */
export function isValidLocation(value: string, ports: readonly PortInfo[]) {
  switch (true) {
    case value.startsWith('port:'):
      return ports.find((port) => port.path === value.substring(5)) != null
    case value.startsWith('ip:'):
      return isHostWithOptionalPort(value.substring(3))
    default:
      return false
  }
}

// #region Host and Port

export const hostWithOptionalPortPattern = /^((?:\[[A-Fa-f0-9.:]+\])|(?:[\p{N}\p{L}.-]+))(?::([1-9][0-9]*))?$/u

function zodParseHostWithOptionalPort(value: string) {
  const match = hostWithOptionalPortPattern.exec(value)

  if (match == null) {
    return undefined
  }

  if (match[1]?.startsWith('[') === true) {
    match[1] = match[1].slice(1, -1)
  }

  const host = hostSchema.safeParse(match[1])
  const port = z.coerce.number().positive().int().optional().safeParse(match[2])

  return [host, port] satisfies Fixed
}

export function isHostWithOptionalPort(value: string) {
  const result = zodParseHostWithOptionalPort(value)
  if (result == null) return false

  return result[0].success && result[1].success
}

// #region Host name

export function isHost(value: string) {
  return isHostName(value) || isIpV4Address(value) || isIpV6Address(value)
}

export const hostSchema = z.string().refine(isHost)

// #endregion

/**
  Is it a valid hostname?

  From RFC-952 (with relaxation stated in RFC-1123 2.1)

  ```
  Hostname is <hname>
  <hname> = <name>*["."<name>]
  <name> = <let-or-digit>[*[<let-or-digit-or-hyphen]<let-or-digit]
  ```

  So, the regular expression would be,

  ```
  <name> = /[\p{N}\p{L}](?:[\p{N}\p{L}-]*[\p{N}\p{L}])?/gu
  <hname> /^<name>(?:\.<name>)*$/gu
  ```

  Fully rendered in hostNamePattern, with non-capture groups
  to capturing converted for better readability.
*/
const hostNamePattern = /^[\p{N}\p{L}]([\p{N}\p{L}-]*[\p{N}\p{L}])?(\.[\p{N}\p{L}]([\p{N}\p{L}-]*[\p{N}\p{L}])?)*$/u
/** Determines whether a string is a hostname. */
export const isHostName = (value: string) => hostNamePattern.test(value)
export const hostNameSchema = z.string().regex(hostNamePattern)

// #region IPv4

/**
  Zod's IP pattern allows some invalid address strings, such as double-zero, `00`.
  These days IPv4 is generally always in decimal, not octal. It seems Zod was
  aiming for this. With this in mind, the definition is as follows.

  ```
  <address> = <octet> 3 * ("." <octet>)
  <octet> = /(25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([1-9][0-9])|[0-9]/ # 0 - 255
  ```
*/
const ipV4Pattern =
  /^((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([1-9][0-9])|[0-9])(\.((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([1-9][0-9])|[0-9])){3}$/u
/** Determines whether a string is an IPv4 address */
export const isIpV4Address = (value: string): value is `${number}.${number}.${number}.${number}` =>
  ipV4Pattern.test(value)
export const ipV4AddressSchema = z.string().regex(ipV4Pattern)

// #endregion

// #region IPv6

/**
  Zod's IPv6 pattern allows a lot of invalid and misses some valid addresses.
  See {@link https://github.com/colinhacks/zod/issues/2339}.
  The RFCs seems indicate the following pattern.

  IPv6

  ```
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
  ```
*/
const ipPairPattern = /^[0-9A-Fa-f]{1,4}$/u

function parsePossibleIpString(value: string) {
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

  // Split if compact. Will only produce one or two results.
  const sep = parts.indexOf('')
  if (sep >= 0) {
    // We add a zero to the second array to simply compact form logic.
    // This is because the extra zero can stand for the at least one
    // missing pair in the compact form.
    return [parts.slice(0, sep), ['0', ...parts.slice(sep + 1)]] satisfies Fixed
  }

  return [parts] satisfies Fixed
}

function isValidFullIpV6(value: string[]) {
  /* v8 ignore next 1 */ // Unlikely to be undefined.
  const last = value.pop() ?? ''

  // IPv4 translation.
  if (ipV4Pattern.test(last)) {
    return value.length === 6 && value.every((p) => ipPairPattern.test(p))
  }

  // IPv6, only 7 since we pop'ped the last.
  return value.length === 7 && value.every((p) => ipPairPattern.test(p)) && ipPairPattern.test(last)
}

function isValidCompactIpV6([left, right]: [string[], string[]]) {
  /* v8 ignore next 1 */ // Unlikely to be undefined.
  const last = right.pop() ?? ''

  // IPv4 translation, won't test on an empty right.
  if (ipV4Pattern.test(last)) {
    return (
      left.length + right.length <= 6 &&
      left.every((p) => ipPairPattern.test(p)) &&
      right.every((p) => ipPairPattern.test(p))
    )
  }

  // IPv6, only 7 since we pop'ed the last.
  // Empty arrays won't have anything to
  // test and are valid as zero leading.
  return (
    left.length + right.length <= 7 &&
    left.every((p) => ipPairPattern.test(p)) &&
    right.every((p) => ipPairPattern.test(p)) &&
    ipPairPattern.test(last)
  )
}

export function isIpV6Address(value: string) {
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

export const ipV6AddressSchema = z.string().refine(isIpV6Address)

// #endregion

// #endregion
