import { createSharedComposable, useConfirmDialog } from '@vueuse/core'
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { z } from 'zod'
import { useErrors } from '../hooks/errors'
import { useResponsiveModal } from '../hooks/vuetify'

export const AlertModalOptions = z
  .string()
  .min(1)
  .or(
    z.object({
      title: z.string().min(1).optional(),
      message: z.string().min(1),
      button: z.string().min(1).optional(),
      color: z.string().min(1).optional()
    })
  )
  .transform((value) => (typeof value === 'string' ? { message: value } : value))

export type AlertModalOptions = z.input<typeof AlertModalOptions>
export type AlertModalConfiguration = z.output<typeof AlertModalOptions>

export const useAlertModal = createSharedComposable(() => {
  const { isRevealed, onReveal, confirm, reveal } = useConfirmDialog<AlertModalConfiguration, never, never>()

  const show = async (options: AlertModalOptions) => {
    await reveal(AlertModalOptions.parse(options))
  }

  return {
    isRevealed,
    onReveal,
    confirm,
    show
  }
})

const ConfirmModalOptions = z
  .string()
  .min(1)
  .or(
    z.object({
      title: z.string().min(1).optional(),
      message: z.string().min(1),
      confirmButton: z.string().min(1).optional(),
      cancelButton: z.string().min(1).optional(),
      color: z.string().min(1).default('primary')
    })
  )
  .transform((value) => (typeof value === 'string' ? { message: value, color: 'primary' } : value))

export type ConfirmModalOptions = z.input<typeof ConfirmModalOptions>
export type ConfirmModalConfiguration = z.output<typeof ConfirmModalOptions>

export const useConfirmModal = createSharedComposable(function useConfirmModal() {
  const { isRevealed, onReveal, confirm, cancel, reveal } = useConfirmDialog<ConfirmModalConfiguration, never, never>()

  const show = async (options: ConfirmModalOptions) => {
    const result = await reveal(ConfirmModalOptions.parse(options))

    return !result.isCanceled
  }

  return {
    isRevealed,
    onReveal,
    confirm,
    cancel,
    show
  }
})

const ErrorModalOptions = z
  .string()
  .min(1)
  .or(
    z.object({
      title: z.string().min(1).optional(),
      button: z.string().min(1).optional(),
      color: z.string().min(1).default('error')
    })
  )
  .optional()
  .transform((value) => (typeof value === 'string' ? { title: value, color: 'error' } : (value ?? { color: 'error' })))

export type ErrorModalOptions = z.input<typeof ErrorModalOptions>
export type ErrorModalConfiguration = z.output<typeof ErrorModalOptions>

export const useDialogs = createSharedComposable(function useDialogs() {
  const { toErrorMessage } = useErrors()
  const alertModal = useAlertModal()
  const confirmModal = useConfirmModal()

  const alert = async (...args: Parameters<typeof alertModal.show>) => {
    await alertModal.show(...args)
  }

  const confirm = async (...args: Parameters<typeof confirmModal.show>) => await confirmModal.show(...args)

  const error = async (cause: unknown, options?: ErrorModalOptions) => {
    const { header, message } = toErrorMessage(cause)
    const { title = header, button, color } = ErrorModalOptions.parse(options)

    console.error(cause)

    await alert({ title, message, button, color })
  }

  return {
    alert,
    confirm,
    error
  }
})

export function useTieDialog() {
  const { smAndDown } = useDisplay()
  const model = useResponsiveModal(smAndDown, { maxWidth: 640, rounded: 'xl' })

  return { breakpoint: smAndDown, ...model }
}

export function useSourceDialog() {
  const { xs } = useDisplay()
  const model = useResponsiveModal(xs, { maxWidth: 480, rounded: 'xl' })

  return { breakpoint: xs, ...model }
}

export function useSwitchDialog() {
  const { width } = useDisplay()
  const breakpoint = computed(() => width.value <= 700)

  const model = useResponsiveModal(breakpoint, { minWidth: 640, maxWidth: 800, rounded: 'xl' })

  return { breakpoint, ...model }
}
