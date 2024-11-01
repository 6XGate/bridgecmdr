import { defineStore } from 'pinia'
import { forceUndefined } from '../helpers/utilities'
import { useClient } from './rpc'
import { useDataStore } from './store'
import type { DocumentId } from './store'
import type { NewSwitch, Switch, SwitchUpdate } from '../../preload/api'

export type { NewSwitch, Switch, SwitchUpdate } from '../../preload/api'

export const useSwitches = defineStore('switches', function defineSwitches() {
  const { switches } = useClient()
  const store = useDataStore<Switch>()

  function blank(): NewSwitch {
    return {
      driverId: forceUndefined(),
      title: forceUndefined(),
      path: 'port:'
    }
  }

  const compact = store.defineOperation(async () => {
    await switches.compact.mutate()
  })

  const all = store.defineFetchMany(async () => await switches.all.query())

  const get = store.defineFetch(async (id: DocumentId) => await switches.get.query(id))

  const add = store.defineInsertion(async (document: NewSwitch) => await switches.add.mutate(document))

  const update = store.defineMutation(async (document: SwitchUpdate) => await switches.update.mutate(document))

  const remove = store.defineRemoval(async (id: DocumentId) => {
    await switches.remove.mutate(id)
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
    remove,
    dismiss: store.unsetCurrent,
    clear: store.clearItems
  }
})
