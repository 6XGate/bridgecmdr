import type { NumberFormatOptions, DateTimeFormatOptions, LocaleMessage } from '@intlify/core-base'
import type { IntlNumberFormat, IntlDateTimeFormat, DefaultLocaleMessageSchema, MessageFunction } from 'vue-i18n'

type DefineMessageSubSchema<Schema, T> =
  Schema extends LocaleMessage<T | MessageFunction<T>>
    ? { [K in keyof Schema]: DefineMessageSubSchema<Schema[K], T> }
    : MessageFunction<T> | string

/**
 * Defines an i18n message schema that can except either strings or message functions,
 * while leaving the general schema structure intact.
 */
export type DefineMessageSchema<Schema extends DefaultLocaleMessageSchema = DefaultLocaleMessageSchema, T = string> =
  Schema extends LocaleMessage<T | MessageFunction<T>>
    ? { [K in keyof Schema]: DefineMessageSubSchema<Schema[K], T> }
    : DefaultLocaleMessageSchema

/**
 * Defines an i18n date/time format schema that is only typed as the generic set of options,
 * while leaving the general schema structure intact.
 */
export type DefineDateTimeFormatSchema<Schema extends IntlDateTimeFormat> = {
  [K in keyof Schema]: DateTimeFormatOptions
}

/**
 * Defines an i18n date/time format schema that is only typed as the generic set of options,
 * while leaving the general schema structure intact.
 */
export type DefineNumberFormatSchema<Schema extends IntlNumberFormat> = { [K in keyof Schema]: NumberFormatOptions }
