import type { IntlNumberFormat } from 'vue-i18n'

export default {
  integer: {
    style: 'decimal',
    minimumIntegerDigits: 1,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true
  }
} satisfies IntlNumberFormat
