import type { DefineDateTimeFormatSchema, DefineMessageSchema, DefineNumberFormatSchema } from '@/helpers/i18n'
import type enDateTimes from '@/locales/en/datetimes'
import type en from '@/locales/en/messages.json'
import type enNumbers from '@/locales/en/numbers'

export type Locales = 'en'
export type MessageSchema = DefineMessageSchema<typeof en>
export type NumberSchema = DefineNumberFormatSchema<typeof enNumbers>
export type DateTimeSchema = DefineDateTimeFormatSchema<typeof enDateTimes>
export interface I18nSchema { message: MessageSchema, datetime: DateTimeSchema, number: NumberSchema }
