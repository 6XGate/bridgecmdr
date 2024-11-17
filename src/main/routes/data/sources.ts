import { z } from 'zod'
import useSourcesDatabase, { NewSource, SourceUpdate } from '../../dao/sources'
import { DocumentId } from '../../services/database'
import { procedure, router } from '../../services/rpc/trpc'
import { Attachment } from '@/attachments'

export type { Source, NewSource, SourceUpdate } from '../../dao/sources'

const InsertInputs = z.tuple([NewSource]).rest(z.instanceof(Attachment))
const UpdateInputs = z.tuple([SourceUpdate]).rest(z.instanceof(Attachment))

export default function useSourcesRouter() {
  const sources = useSourcesDatabase()
  return router({
    compact: procedure.mutation(async () => {
      await sources.compact()
    }),
    all: procedure.query(async () => await sources.all()),
    get: procedure.input(DocumentId).query(async ({ input }) => await sources.get(input)),
    add: procedure.input(InsertInputs).mutation(async ({ input }) => await sources.add(...input)),
    update: procedure.input(UpdateInputs).mutation(async ({ input }) => await sources.update(...input)),
    remove: procedure.input(DocumentId).mutation(async ({ input }) => {
      await sources.remove(input)
    }),
    clear: procedure.mutation(async () => {
      await sources.clear()
    })
  })
}
