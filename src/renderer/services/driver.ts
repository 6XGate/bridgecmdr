import { createSharedComposable } from '@vueuse/shared'
import { computed, reactive, readonly, ref, shallowReadonly } from 'vue'
import { trackBusy } from '../hooks/tracking'
import i18n from '../plugins/i18n'
import { useClient } from './rpc'
import type {
  kDeviceHasNoExtraCapabilities as HasNoExtraCapabilities,
  kDeviceSupportsMultipleOutputs as SupportsMultipleOutputs,
  kDeviceCanDecoupleAudioOutput as CanDecoupleAudioOutput,
  LocalizedDriverInformation,
  DriverBasicInformation
} from '../../preload/api'

/** The device has no extended capabilities. */
export type kDeviceHasNoExtraCapabilities = HasNoExtraCapabilities
export const kDeviceHasNoExtraCapabilities: HasNoExtraCapabilities = 0
/** The device has multiple output channels. */
export type kDeviceSupportsMultipleOutputs = SupportsMultipleOutputs
export const kDeviceSupportsMultipleOutputs: SupportsMultipleOutputs = 1
/** The device support sending the audio output to a different channel. */
export type kDeviceCanDecoupleAudioOutput = CanDecoupleAudioOutput
export const kDeviceCanDecoupleAudioOutput: CanDecoupleAudioOutput = 2

/** Informational metadata about a device and driver. */
export interface DriverInformation extends DriverBasicInformation, LocalizedDriverInformation {
  // Just combines the locatized information with the basic information.
}

/** Driver to interact with switching devices. */
export interface Driver extends DriverInformation {
  /**
   * Sets input and output ties.
   *
   * @param input The input channel to tie.
   * @param videoOutput The output video channel to tie.
   * @param audioOutput The output audio channel to tie.
   */
  readonly activate: (input: number, videoOutput: number, audioOutput: number) => Promise<void>
  /** Powers on the switch or monitor. */
  readonly powerOn: () => Promise<void>
  /** Powers on the switch or monitor and closes the driver. */
  readonly powerOff: () => Promise<void>
  /** The URI to the device being driven. */
  readonly uri: string
}

const useDrivers = createSharedComposable(function useDrivers() {
  const client = useClient()

  /** Busy tracking. */
  const tracker = trackBusy()

  /** The registered drivers. */
  const items = ref(new Array<DriverInformation>())

  const registry = new Map<string, DriverInformation>()

  async function all() {
    if (items.value.length > 0) return items.value
    const drivers = await tracker.wait(client.drivers.all.query())
    for (const {
      metadata: { enabled, experimental, guid, localized, capabilities }
    } of drivers) {
      /** The localized driver information made i18n compatible. */
      for (const [locale, description] of Object.entries(localized)) {
        i18n.global.mergeLocaleMessage(locale as never, {
          $driver: { [guid]: { ...description } }
        })
      }

      registry.set(
        guid,
        readonly({
          enabled,
          experimental,
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

    items.value = Array.from(registry.values())
    return items.value
  }

  function load(guid: string, uri: string): Driver {
    if (items.value.length === 0) {
      throw new ReferenceError(`No driver "${guid}"`)
    }

    const driver = registry.get(guid)
    if (driver == null) {
      throw new ReferenceError(`No driver "${guid}"`)
    }

    async function activate(input: number, videoOutput: number, audioOutput: number) {
      await client.drivers.activate.mutate([guid, uri, input, videoOutput, audioOutput])
    }

    async function powerOn() {
      await client.drivers.powerOn.mutate([guid, uri])
    }

    async function powerOff() {
      await client.drivers.powerOff.mutate([guid, uri])
    }

    return readonly({
      ...driver,
      activate,
      powerOn,
      powerOff,
      uri
    })
  }

  return reactive({
    isBusy: tracker.isBusy,
    error: tracker.error,
    items: computed(() => shallowReadonly(items.value)),
    all,
    load
  })
})

export default useDrivers
