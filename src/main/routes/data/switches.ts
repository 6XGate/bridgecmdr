import { NewSwitch, SwitchUpdate, useSwitchesDatabase } from '../../dao/switches'
import { DocumentId } from '../../services/database'
import { procedure, router } from '../../services/trpc'

export { Switch, NewSwitch, SwitchUpdate } from '../../dao/switches'

export default function useSourcesRouter() {
  const switches = useSwitchesDatabase()
  return router({
    compact: procedure.mutation(async () => {
      await switches.compact()
    }),
    all: procedure.query(async () => await switches.all()),
    get: procedure.input(DocumentId).query(async ({ input }) => await switches.get(input)),
    add: procedure.input(NewSwitch).mutation(async ({ input }) => await switches.add(input)),
    update: procedure.input(SwitchUpdate).mutation(async ({ input }) => await switches.update(input)),
    remove: procedure.input(DocumentId).mutation(async ({ input }) => {
      await switches.remove(input)
    })
  })
}
