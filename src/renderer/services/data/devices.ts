import { defineStore } from 'pinia'
import { forceUndefined } from '../../hooks/utilities'
import { useClient } from '../rpc/trpc'
import { useDataStore } from '../store'
import type { NewDevice, Device, DeviceUpdate, DeviceUpsert } from '../../../preload/api'
import type { DocumentId } from '../store'

export type { NewDevice, Device, DeviceUpdate } from '../../../preload/api'

export const useDevices = defineStore('devices', function defineDevices() {
  const { devices } = useClient()
  const store = useDataStore<Device>()

  function blank(): NewDevice {
    return {
      driverId: forceUndefined(),
      title: forceUndefined(),
      path: 'port:'
    }
  }

  const compact = store.defineOperation(async () => {
    await devices.compact.mutate()
  })

  const all = store.defineFetchMany(async () => await devices.all.query())

  const get = store.defineFetch(async (id: DocumentId) => await devices.get.query(id))

  const add = store.defineInsertion(async (document: NewDevice) => await devices.add.mutate(document))

  const update = store.defineMutation(async (document: DeviceUpdate) => await devices.update.mutate(document))

  const upsert = store.defineMutation(async (document: DeviceUpsert) => await devices.upsert.mutate(document))

  const remove = store.defineRemoval(async (id: DocumentId) => {
    await devices.remove.mutate(id)
    return id
  })

  return {
    isBusy: store.isBusy,
    error: store.error,
    items: store.items,
    current: store.current,
    blank,
    compact,
    all,
    get,
    add,
    update,
    upsert,
    remove,
    dismiss: store.unsetCurrent,
    clear: store.clearItems
  }
})
