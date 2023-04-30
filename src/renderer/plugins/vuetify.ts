import { useI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import i18n from '@/plugins/i18n'

import 'vuetify/styles'

const vuetify = createVuetify({
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n })
  },
  defaults: {
    VBtn: { rounded: 'pill' },
    VBtnGroup: {
      rounded: 'pill',
      variant: 'outlined',
      VBtn: { rounded: undefined }
    },
    VCard: { rounded: 'xl', variant: 'flat', elevation: 0 },
    VFileInput: { variant: 'outlined' },
    VSelect: { variant: 'outlined' },
    VSwitch: { inset: true },
    VTextField: { variant: 'outlined' }
  },
  display: {
    mobileBreakpoint: 'sm'
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  theme: {
    variations: {
      colors: ['primary', 'secondary'],
      lighten: 4,
      darken: 4
    }
  }
})

export default vuetify
