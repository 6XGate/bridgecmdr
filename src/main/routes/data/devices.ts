import useDevicesDatabase, { NewDevice, DeviceUpdate, DeviceUpsert } from '../../dao/devices'
import { DocumentId } from '../../services/database'
import { procedure, router } from '../../services/rpc/trpc'

export default function useDevicesRouter() {
  const devices = useDevicesDatabase()
  return router({
    compact: procedure.mutation(async () => {
      await devices.compact()
    }),
    all: procedure.query(async () => await devices.all()),
    get: procedure.input(DocumentId).query(async ({ input }) => await devices.get(input)),
    add: procedure.input(NewDevice).mutation(async ({ input }) => await devices.add(input)),
    update: procedure.input(DeviceUpdate).mutation(async ({ input }) => await devices.update(input)),
    upsert: procedure.input(DeviceUpsert).mutation(async ({ input }) => await devices.upsert(input)),
    remove: procedure.input(DocumentId).mutation(async ({ input }) => {
      await devices.remove(input)
    }),
    clear: procedure.mutation(async () => {
      await devices.clear()
    })
  })
}
