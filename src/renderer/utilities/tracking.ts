import { toValue } from '@vueuse/core'
import { computed, ref, shallowRef } from 'vue'
import { useErrors } from '@/helpers/errors'
import type { MaybeRefOrGetter } from '@vueuse/core'

type Trackable<T> =
  | (() => PromiseLike<T>)
  | (() => Promise<T>)
  | (() => T)
  | PromiseLike<T>
  | Promise<T>

export const trackBusy = (...chain: Array<MaybeRefOrGetter<boolean>>) => {
  const { toError } = useErrors()

  /** The busy weight. */
  const weight = ref(0)

  /** The last error. */
  const error = shallowRef<Error>()

  /** Tracks an asynchronous operation or promise, return its result. */
  const wait = async <R> (trackable: Trackable<R>) => {
    try {
      ++weight.value
      const result = await (typeof trackable === 'function' ? trackable() : trackable)
      error.value = undefined

      return result
    } catch (e) {
      error.value = toError(e)

      throw e
    } finally {
      --weight.value
    }
  }

  /** Wraps an asynchronous operation. */
  const track = <R, Args extends unknown[]> (cb: (...args: Args) => PromiseLike<R>) =>
    async (...args: Args) => await wait(() => cb(...args))

  return {
    isBusy: computed(() => chain.some(r => toValue(r)) || weight.value > 0),
    error: computed(() => error.value),
    wait,
    track
  }
}

export type Tracker = ReturnType<typeof trackBusy>
