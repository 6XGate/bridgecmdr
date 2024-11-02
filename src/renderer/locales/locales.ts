import type enDateTimes from './en/datetimes'
import type en from './en/messages.json'
import type enNumbers from './en/numbers'
import type { DefineDateTimeFormatSchema, DefineMessageSchema, DefineNumberFormatSchema } from '../support/i18n'

export type Locales = 'en'
export type MessageSchema = DefineMessageSchema<typeof en>
export type NumberSchema = DefineNumberFormatSchema<typeof enNumbers>
export type DateTimeSchema = DefineDateTimeFormatSchema<typeof enDateTimes>
export interface I18nSchema {
  message: MessageSchema
  datetime: DateTimeSchema
  number: NumberSchema
}
