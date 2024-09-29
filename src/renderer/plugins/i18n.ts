import { createI18n } from 'vue-i18n'
import { en as vuetifyEn$ } from 'vuetify/locale'
import enDateTimes from '../locales/en/datetimes'
import enFunction from '../locales/en/functions'
import en from '../locales/en/messages.json'
import enNumbers from '../locales/en/numbers'
import type { DateTimeSchema, Locales, MessageSchema, NumberSchema } from '../locales/locales'
import type { MergeDeep } from 'type-fest'
import { deepAssign } from '@/object'

type CompleteSchema = MergeDeep<MessageSchema, { $vuetify: typeof vuetifyEn$ }>
interface CompleteI18nSchema {
  message: CompleteSchema
  datetime: DateTimeSchema
  number: NumberSchema
}

// Missing translation warning tracker.
const warned = new Set<string>()

const i18n = createI18n<CompleteI18nSchema, Locales, false>({
  // Using the composition API.
  legacy: false,
  globalInjection: true,
  // Locales.
  locale: 'en',
  fallbackLocale: 'en',
  // Handling the warnings due to mixed global and local messages.
  fallbackWarn: false,
  missingWarn: false,
  missing: (...[locale, key, , type]) => {
    const checkKey = type != null ? `${locale}/${type}/${key}` : `${locale}/key/${key}`

    if (!warned.has(checkKey)) {
      console.warn(
        type != null ? `Missing ${type} key "${key}" for "${locale}"` : `Missing key "${key}" for "${locale}"`
      )
    }

    warned.add(checkKey)
  },
  // Localization messages and data.
  messages: {
    en: { ...deepAssign(en, enFunction), $vuetify: vuetifyEn$ }
  },
  numberFormats: {
    en: enNumbers
  },
  datetimeFormats: {
    en: enDateTimes
  }
})

export default i18n
