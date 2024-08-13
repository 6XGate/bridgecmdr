import { createSharedComposable } from '@vueuse/core'
import { readonly, computed, reactive } from 'vue'
import i18n from '../plugins/i18n'
import { trackBusy } from '../utilities/tracking'
import useBridgedApi from './bridged'

const api = useBridgedApi()

/** The device has no extended capabilities. */
export const kDeviceHasNoExtraCapabilities = api.driver.capabilities.kDeviceHasNoExtraCapabilities
/** The device has multiple output channels. */
export const kDeviceSupportsMultipleOutputs = api.driver.capabilities.kDeviceSupportsMultipleOutputs
/** The device support sending the audio output to a different channel. */
export const kDeviceCanDecoupleAudioOutput = api.driver.capabilities.kDeviceCanDecoupleAudioOutput

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
const useDriverCore = createSharedComposable(() => {
  const registry = reactive(new Map<string, DriverInformation>())

  /** Loads the drivers, using the first i18n we can get. */
  const loadList = async () => {
    if (registry.size > 0) {
      // Already loaded...
      return
    }

    ;(await api.driver.list()).forEach(({ guid, localized, capabilities }) => {
      /** The localized driver information made i18n compatible. */
      Object.entries(localized).forEach(([locale, description]) => {
        i18n.global.mergeLocaleMessage(locale as never, {
          $driver: {
            [guid]: { ...description }
          }
        })
      })

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
    })
  }

  return { registry, loadList }
})

/** Use drivers. */
export const useDrivers = () => {
  const { registry, loadList } = useDriverCore()
  const { freeHandle } = api

  /** Busy tracking. */
  const tracker = trackBusy()

  /** The registered drivers. */
  const items = computed(() => Array.from(registry.values()))

  /** Loads information about all the drivers. */
  const all = tracker.track(async () => {
    await loadList()
  })

  /** Loads a driver registered in the registry. */
  const load = async (guid: string, path: string): Promise<Driver> => {
    await loadList()
    if (!registry.has(guid)) {
      throw new Error(`No such driver registered as "${guid}"`)
    }

    const h = await api.driver.open(guid, path)

    const activate = async (inputChannel: number, videoOutputChannel: number, audioOutputChannel: number) => {
      await api.driver.activate(h, inputChannel, videoOutputChannel, audioOutputChannel)
    }

    const powerOn = async () => {
      await api.driver.powerOn(h)
    }

    const powerOff = async () => {
      await api.driver.powerOff(h)
      await freeHandle(h)
    }

    const close = async () => {
      await freeHandle(h)
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
