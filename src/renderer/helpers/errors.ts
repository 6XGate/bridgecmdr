import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import type { I18nSchema } from '../locales/locales'
import { getMessage, getZodMessage } from '@/error-handling'

interface ErrorMessage {
  header?: string | undefined
  message: string
}

export function useErrors() {
  const { t } = useI18n<I18nSchema>()

  function toErrorMessage(error: unknown): ErrorMessage {
    // Any value that is not an error message may
    // only be used as the message body.
    if (!(error instanceof Error)) {
      return { message: getMessage(error) }
    }

    // Zod errors may only be used as the message
    // body. They may be too verbose for the
    // title.
    if (error instanceof z.ZodError) {
      return { message: getZodMessage(error) ?? t('error.zod') }
    }

    // If the error does not have a cause,
    // it can only be the message body.
    if (error.cause == null) {
      return { message: error.message }
    }

    // Any non-nullish value that is not an error
    // can be used as the message body, so this
    // error may be used as the header.
    if (!(error.cause instanceof Error)) {
      return { header: error.message, message: getMessage(error.cause) }
    }

    // Zod errors may be used as the message body
    // and this one as the header, but only if
    // a message can be extracted from the
    // Zod error; otherwise, this error
    // will be the message body.
    if (error.cause instanceof z.ZodError) {
      const message = getZodMessage(error.cause)
      return message != null ? { header: error.message, message } : { message: error.message }
    }

    return { header: error.message, message: error.cause.message }
  }

  return {
    toErrorMessage
  }
}
