import useTiesDatabase, { NewTie, TieUpdate } from '../../dao/ties'
import { DocumentId } from '../../services/database'
import { procedure, router } from '../../services/trpc'

export type { Tie, NewTie, TieUpdate } from '../../dao/ties'

export default function useTiesRouter() {
  const ties = useTiesDatabase()
  return router({
    compact: procedure.mutation(async () => {
      await ties.compact()
    }),
    all: procedure.query(async () => await ties.all()),
    get: procedure.input(DocumentId).query(async ({ input }) => await ties.get(input)),
    add: procedure.input(NewTie).mutation(async ({ input }) => await ties.add(input)),
    update: procedure.input(TieUpdate).mutation(async ({ input }) => await ties.update(input)),
    remove: procedure.input(DocumentId).mutation(async ({ input }) => {
      await ties.remove(input)
    }),
    forSwitch: procedure.input(DocumentId).query(async ({ input }) => await ties.forSwitch(input)),
    forSource: procedure.input(DocumentId).query(async ({ input }) => await ties.forSource(input))
  })
}
