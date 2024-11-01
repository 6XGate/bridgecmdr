import { memo } from 'radash'
import { z } from 'zod'
import useUserStore from '../../dao/storage'
import { procedure, router } from '../../services/trpc'

const useUserStoreRouter = memo(function useUserStoreRouter() {
  const storage = useUserStore()

  const SetItemInputs = z.tuple([z.string(), z.string()])

  return router({
    getItem: procedure.input(z.string()).query(async ({ input }) => await storage.getItem(input)),
    setItem: procedure.input(SetItemInputs).mutation(async ({ input }) => {
      await storage.setItem(...input)
    }),
    removeItem: procedure.input(z.string()).mutation(async ({ input }) => {
      await storage.removeItem(input)
    }),
    clear: procedure.mutation(async () => {
      await storage.clear()
    })
  })
})

export default useUserStoreRouter
