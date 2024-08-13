import { nextTick } from 'vue'
import { useDialogs } from '../modals/dialogs'
import type { PropType } from 'vue'
import type { z } from 'zod'

type ExtractPropOptionsFromZod<Schema extends z.ZodTypeAny> =
  Schema extends z.ZodOptional<infer Inner>
    ? { type: PropType<z.infer<Inner>> }
    : Schema extends z.ZodDefault<infer Inner>
      ? { type: PropType<z.infer<Inner>>; default: () => Exclude<z.infer<Inner>, null | undefined> }
      : { type: PropType<z.infer<Schema>>; required: true }

export const fromSchema = <Schema extends z.ZodTypeAny>(schema: Schema) => {
  const validator = (value: unknown) => schema.safeParse(value).success

  if ('removeDefault' in schema) {
    return {
      validator,
      default: () => schema.parse(undefined) as unknown
    } as unknown as ExtractPropOptionsFromZod<Schema>
  }

  if (schema.isOptional()) {
    return {
      validator,
      default: schema.isNullable() ? null : undefined
    } as unknown as ExtractPropOptionsFromZod<Schema>
  }

  if (schema.isNullable()) {
    return { validator, default: null } as unknown as ExtractPropOptionsFromZod<Schema>
  }

  return { validator, required: true } as unknown as ExtractPropOptionsFromZod<Schema>
}

export const useNextTick = (fn: () => unknown) => {
  const dialogs = useDialogs()

  return () => {
    nextTick()
      .then(fn)
      .catch(async (e: unknown) => {
        await dialogs.error(e)
      })
  }
}
