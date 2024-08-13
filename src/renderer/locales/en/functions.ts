import type { MessageContext } from '@intlify/core-base'

// HACK: Very likely Vuelidate doesn't pass the plural/count, so Vue i18n plural won't work.
// Must match, or be, the pluralization rule/handler for the current locale.
const pluralUsing = <T = string>(messages: [T, T, ...T[]], plural: number) => {
  if (messages[2] == null) {
    return plural === 1 ? messages[0] : messages[1]
  }

  if (plural === 0) {
    return messages[0]
  }

  return plural === 1 ? messages[1] : messages[2]
}

const en = {
  validations: {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- Not a concern.
    minLength: ({ named }: MessageContext) => {
      const min = Number(named('min'))

      return typeof named('model') === 'string'
        ? pluralUsing(['The value must not be empty', `The value must at least ${min} characters long`], min)
        : pluralUsing(['The value must not be empty', `The value must have at least ${min} entries`], min)
    },
    // eslint-disable-next-line @typescript-eslint/unbound-method -- Not a concern.
    maxLength: ({ named }: MessageContext) => {
      const max = Number(named('max'))

      return typeof named('model') === 'string'
        ? pluralUsing(
            [
              'The value must be empty',
              'The value cannot be more than one character long',
              `The value cannot be more than ${max} characters long`
            ],
            max
          )
        : pluralUsing(
            [
              'The value must be empty',
              'The value cannot have more than one entry',
              `The value cannot have more than ${max} entries`
            ],
            max
          )
    }
  }
}

export default en
