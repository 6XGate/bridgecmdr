import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { useImages } from '../hooks/assets'
import { trackBusy } from '../hooks/tracking'
import { toFiles } from '../support/files'
import { useDevices } from './data/devices'
import { useSources } from './data/sources'
import { useTies } from './data/ties'
import useDrivers from './driver'
import useSettings from './settings'
import type { Source } from './data/sources'
import type { Driver } from './driver'
import type { DocumentId } from './store'
import type { ReadonlyDeep } from 'type-fest'
import { isNotNullish } from '@/basics'

export interface Button {
  readonly guid: string
  readonly title: string
  readonly image: string | undefined
  order: number
  isActive: boolean
  activate: () => Promise<void>
  setOrder: (to: number) => void
}

export const useDashboard = defineStore('dashboard', function defineDashboard() {
  const isReady = ref(false)

  const settings = useSettings()
  const drivers = useDrivers()
  const ties = useTies()
  const sources = useSources()
  const devices = useDevices()
  const tracker = trackBusy(
    () => !isReady.value,
    () => drivers.isBusy,
    () => sources.isBusy,
    () => devices.isBusy,
    () => ties.isBusy
  )

  const loadedDrivers = new Map<DocumentId, Driver>()

  const { images, loadImages } = useImages()
  const items = ref<Button[]>([])

  async function loadDrivers() {
    await drivers.all()

    // Remove drivers for devices removed
    const closing: Driver[] = []
    for (const guid of loadedDrivers.keys()) {
      if (devices.items.find((device) => device._id === guid) == null) {
        const driver = loadedDrivers.get(guid)
        if (driver != null) {
          loadedDrivers.delete(guid)
          closing.push(driver)
        }
      }
    }

    // Load any drivers that are new or are being replaced.
    const loading = new Array<[string, Driver]>()
    for (const device of devices.items) {
      const driver = loadedDrivers.get(device._id)
      if (driver == null || driver.uri !== device.path) {
        loading.push([device._id, drivers.load(device.driverId, device.path)])
      }
    }

    // Add the replaced and new driver to the loaded registry.
    for (const [guid, driver] of loading) {
      loadedDrivers.set(guid, driver)
    }
  }

  let orderUpdates = 0
  async function normalize() {
    orderUpdates += 1
    if (orderUpdates === 100) {
      orderUpdates = 0
      await sources.normalizeOrder()
      await refresh()
    }
  }

  function defineButton(source: ReadonlyDeep<Source>, index: number): Button {
    const commands = ties.items
      .filter((tie) => tie.sourceId === source._id)
      .map(function makeCommand(tie) {
        const device = devices.items.find((item) => tie.deviceId === item._id)
        const driver = loadedDrivers.get(tie.deviceId)

        if (device == null) {
          console.error(`${tie.deviceId}: No such device for source "${source.title}"`)

          return undefined
        }

        if (driver == null) {
          console.error(
            `${device.driverId}:  No such driver for device "${device.title}" used by source "${source.title}"`
          )

          return undefined
        }

        return { tie, device, driver }
      })
      .filter(isNotNullish)

    async function activate() {
      for (const button of items.value) {
        button.isActive = false
      }

      await Promise.allSettled(
        commands.map(async ({ tie, driver }) => {
          await driver
            .activate(tie.inputChannel, tie.outputChannels.video ?? 0, tie.outputChannels.audio ?? 0)
            .catch((cause: unknown) => {
              console.warn('tie activation failure', cause)
            })
        })
      )
    }

    function setOrder(to: number) {
      orderUpdates += 1
      sources
        .update({ _id: source._id, order: to })
        .then(normalize)
        // .then(refresh)
        .catch((cause: unknown) => {
          console.warn('Failed to update order', cause)
        })
    }

    return {
      guid: source._id,
      title: source.title,
      image: images.value[index],
      isActive: false,
      order: source.order,
      activate,
      setOrder
    }
  }

  function prepareButton(button: Button) {
    const activate = button.activate
    const setOrder = button.setOrder

    button.activate = async () => {
      await activate()
      button.isActive = true
    }

    button.setOrder = (to: number) => {
      button.order = to
      setOrder(to)

      // HACK: To allow external reference to trigger, resort the list
      // completely.
      items.value.sort((a, b) => a.order - b.order)
    }

    return button
  }

  async function setupDashboard() {
    loadImages(
      sources.items.map((source) =>
        toFiles(source._attachments).find((f) => source.image != null && f.name === source.image)
      )
    )
    items.value = (await Promise.all(sources.items.map(defineButton).map(prepareButton))).sort(
      (a, b) => a.order - b.order
    )
  }

  let poweredOn = false
  async function powerOnOnce() {
    if (poweredOn) return
    if (!settings.powerOnSwitchesAtStart) return
    await Promise.allSettled(
      [...loadedDrivers.values()].map(async (driver) => {
        await driver.powerOn().catch((cause: unknown) => {
          console.warn('device power off failure', cause)
        })
      })
    )

    poweredOn = true
  }

  const refresh = tracker.track(async function refresh() {
    items.value = []
    await Promise.all([ties.compact(), sources.compact(), devices.compact()])
    await Promise.all([ties.all(), sources.all(), devices.all()])
    await loadDrivers()
    await setupDashboard()
    await powerOnOnce()
    isReady.value = true
  })

  async function powerOff() {
    await Promise.allSettled(
      [...loadedDrivers.values()].map(async (driver) => {
        await driver.powerOff().catch((cause: unknown) => {
          console.warn('device power off failure', cause)
        })
      })
    )
  }

  return {
    isBusy: computed(() => tracker.isBusy.value),
    items: computed(() => readonly(items.value)),
    refresh,
    powerOff
  }
})
