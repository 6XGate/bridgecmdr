import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { useImages } from '../hooks/assets'
import { trackBusy } from '../hooks/tracking'
import { toFiles } from '../support/files'
import useDrivers from './driver'
import useSettings from './settings'
import { useSources } from './sources'
import { useSwitches } from './switches'
import { useTies } from './ties'
import type { Driver } from './driver'
import type { Source } from './sources'
import type { DocumentId } from './store'
import type { ReadonlyDeep } from 'type-fest'
import { isNotNullish } from '@/basics'
import { warnPromiseFailures } from '@/error-handling'

export interface Button {
  readonly guid: string
  readonly title: string
  readonly image: string | undefined
  isActive: boolean
  activate: () => Promise<void>
}

export const useDashboard = defineStore('dashboard', function defineDashboard() {
  const isReady = ref(false)

  const settings = useSettings()
  const drivers = useDrivers()
  const ties = useTies()
  const sources = useSources()
  const switches = useSwitches()
  const tracker = trackBusy(
    () => !isReady.value,
    () => drivers.isBusy,
    () => sources.isBusy,
    () => switches.isBusy,
    () => ties.isBusy
  )

  const loadedDrivers = new Map<DocumentId, Driver>()

  const { images, loadImages } = useImages()
  const items = ref<Button[]>([])

  async function loadDrivers() {
    await drivers.all()

    // Remove drivers for switches removed
    const closing: Driver[] = []
    for (const guid of loadedDrivers.keys()) {
      if (switches.items.find((switcher) => switcher._id === guid) == null) {
        const driver = loadedDrivers.get(guid)
        if (driver != null) {
          loadedDrivers.delete(guid)
          closing.push(driver)
        }
      }
    }

    // Load any drivers that are new or are being replaced.
    const loading = new Array<[string, Driver]>()
    for (const switcher of switches.items) {
      const driver = loadedDrivers.get(switcher._id)
      if (driver == null || driver.uri !== switcher.path) {
        loading.push([switcher._id, drivers.load(switcher.driverId, switcher.path)])
      }
    }

    // Add the replaced and new driver to the loaded registry.
    for (const [guid, driver] of loading) {
      loadedDrivers.set(guid, driver)
    }
  }

  function defineButton(source: ReadonlyDeep<Source>, index: number): Button {
    const commands = ties.items
      .filter((tie) => tie.sourceId === source._id)
      .map(function makeCommand(tie) {
        const switcher = switches.items.find((item) => tie.switchId === item._id)
        const driver = loadedDrivers.get(tie.switchId)

        if (switcher == null) {
          console.error(`${tie.switchId}: No such switch for source "${source.title}"`)

          return undefined
        }

        if (driver == null) {
          console.error(
            `${switcher.driverId}:  No such driver for switch "${switcher.title}" used by source "${source.title}"`
          )

          return undefined
        }

        return { tie, switch: switcher, driver }
      })
      .filter(isNotNullish)

    async function activate() {
      for (const button of items.value) {
        button.isActive = false
      }

      warnPromiseFailures(
        'tie activation failure',
        await Promise.allSettled(
          commands.map(async ({ tie, driver }) => {
            await driver.activate(tie.inputChannel, tie.outputChannels.video ?? 0, tie.outputChannels.audio ?? 0)
          })
        )
      )
    }

    return {
      guid: source._id,
      title: source.title,
      image: images.value[index],
      isActive: false,
      activate
    }
  }

  function prepareButton(button: Button) {
    const activate = button.activate
    button.activate = async () => {
      await activate()
      button.isActive = true
    }

    return button
  }

  async function setupDashboard() {
    loadImages(
      sources.items.map((source) =>
        toFiles(source._attachments).find((f) => source.image != null && f.name === source.image)
      )
    )
    items.value = await Promise.all(sources.items.map(defineButton).map(prepareButton))
  }

  let poweredOn = false
  async function powerOnOnce() {
    if (poweredOn) return
    if (!settings.powerOnSwitchesAtStart) return
    warnPromiseFailures(
      'driver power off failure',
      await Promise.allSettled(
        [...loadedDrivers.values()].map(async (driver) => {
          await driver.powerOn()
        })
      )
    )

    poweredOn = true
  }

  const refresh = tracker.track(async function refresh() {
    items.value = []
    await Promise.all([ties.compact(), sources.compact(), switches.compact()])
    await Promise.all([ties.all(), sources.all(), switches.all()])
    await loadDrivers()
    await setupDashboard()
    await powerOnOnce()
    isReady.value = true
  })

  async function powerOff() {
    warnPromiseFailures(
      'driver power off failure',
      await Promise.allSettled(
        [...loadedDrivers.values()].map(async (driver) => {
          await driver.powerOff()
        })
      )
    )
  }

  return {
    isBusy: computed(() => tracker.isBusy.value),
    items: computed(() => readonly(items.value)),
    refresh,
    powerOff
  }
})
