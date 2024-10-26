import { createSharedComposable } from '@vueuse/core'
import { readonly, computed, reactive } from 'vue'
import i18n from '../plugins/i18n'
import { trackBusy } from '../utilities/tracking'

/** The device has no extended capabilities. */
export const kDeviceHasNoExtraCapabilities = services.driver.capabilities.kDeviceHasNoExtraCapabilities
/** The device has multiple output channels. */
export const kDeviceSupportsMultipleOutputs = services.driver.capabilities.kDeviceSupportsMultipleOutputs
/** The device support sending the audio output to a different channel. */
export const kDeviceCanDecoupleAudioOutput = services.driver.capabilities.kDeviceCanDecoupleAudioOutput

/** Informational metadata about a device and driver. */
export interface DriverInformation {
  /** A unique identifier for the driver. */
  readonly guid: string
  /** Defines the title for the driver in a specific locale. */
  readonly title: string
  /** Defines the company for the driver in a specific locale. */
  readonly company: string
  /** Defines the provider for the driver in a specific locale. */
  readonly provider: string
  /** Defines the capabilities of the device driven by the driver. */
  readonly capabilities: number
}

/** Driver to interact with switching devices. */
export interface Driver {
  /**
   * Sets input and output ties.
   *
   * @param inputChannel The input channel to tie.
   * @param videoOutputChannel The output video channel to tie.
   * @param audioOutputChannel The output audio channel to tie.
   */
  readonly activate: (inputChannel: number, videoOutputChannel: number, audioOutputChannel: number) => Promise<void>
  /** Powers on the switch or monitor. */
  readonly powerOn: () => Promise<void>
  /** Powers on the switch or monitor and closes the driver. */
  readonly powerOff: () => Promise<void>
  /** Closes the driver. */
  readonly close: () => Promise<void>
  /** The URI to the device being driven. */
  readonly uri: string
}

/** Core parts of the drive system, so we don't hold any component's effect scope in memory. */
const useDriverCore = createSharedComposable(function useDriverCore() {
  const registry = reactive(new Map<string, DriverInformation>())

  /** Loads the drivers, using the first i18n we can get. */
  async function loadList() {
    if (registry.size > 0) {
      // Already loaded...
      return
    }

    const drivers = await services.driver.list()
    for (const { guid, localized, capabilities } of drivers) {
      /** The localized driver information made i18n compatible. */
      for (const [locale, description] of Object.entries(localized)) {
        i18n.global.mergeLocaleMessage(locale as never, {
          $driver: {
            [guid]: { ...description }
          }
        })
      }

      registry.set(
        guid,
        readonly({
          guid,
          get title() {
            return i18n.global.t(`$driver.${guid}.title`)
          },
          get company() {
            return i18n.global.t(`$driver.${guid}.company`)
          },
          get provider() {
            return i18n.global.t(`$driver.${guid}.provider`)
          },
          capabilities
        })
      )
    }
  }

  return { registry, loadList }
})

/** Use drivers. */
export function useDrivers() {
  const { registry, loadList } = useDriverCore()

  /** Busy tracking. */
  const tracker = trackBusy()

  /** The registered drivers. */
  const items = computed(() => Array.from(registry.values()))

  /** Loads information about all the drivers. */
  const all = tracker.track(async function all() {
    await loadList()
  })

  /** Loads a driver registered in the registry. */
  async function load(guid: string, path: string): Promise<Driver> {
    await loadList()
    if (!registry.has(guid)) {
      throw new Error(`No such driver registered as "${guid}"`)
    }

    const h = await services.driver.open(guid, path)

    async function activate(inputChannel: number, videoOutputChannel: number, audioOutputChannel: number) {
      await services.driver.activate(h, inputChannel, videoOutputChannel, audioOutputChannel)
    }

    async function powerOn() {
      await services.driver.powerOn(h)
    }

    async function powerOff() {
      await services.driver.powerOff(h)
      await services.freeHandle(h)
    }

    async function close() {
      await services.freeHandle(h)
    }

    return readonly({
      activate,
      powerOn,
      powerOff,
      close,
      uri: path
    })
  }

  return reactive({
    isBusy: tracker.isBusy,
    error: tracker.error,
    items: computed(() => readonly(items.value)),
    all,
    load
  })
}
