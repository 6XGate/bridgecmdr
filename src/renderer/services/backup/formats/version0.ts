import { z } from 'zod'

/** General document header. */
export const DocHeader = z.object({
  _id: z.string().uuid()
})
