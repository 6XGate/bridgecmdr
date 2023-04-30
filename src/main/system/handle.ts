import { memo } from 'radash'
import type { Handle } from '@preload/api'

/** The maximum number of handles sans 256. */
const kMaxHandles = 131072

export const kNullHandle = 0 as Handle

// @ts-expect-error T is required to type the resource.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface HandleKey<T> extends Symbol { }

type Close<T> = (resource: T) => unknown | Promise<unknown>

interface Descriptor<T> {
  key: HandleKey<T>
  resource: T
  close: Close<T>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prevent need to cast
type AnyDescriptor = Descriptor<any>

/**
 * Allows the use of an opaque handles for referencing
 * resources by the renderer process.
 */
const useHandles = memo(() => {
  // The first 256 will be reserved, and used as a
  // sanity check for validity.
  const handleMap = new Array<number | AnyDescriptor>(kMaxHandles)
  let nextFree = 0x100

  // Initial the map, ensuring all new element
  // point to their neighbor as the next free.
  // The final entry will point to one past
  // the end of the map, which will mean
  // it has been exhausted.
  for (let i = 0; i !== kMaxHandles; ++i) {
    handleMap[i] = i + 1
  }

  /**
   * Determines whether a handle is valid; and optionally, of a given type.
   * @param handle The handle to check.
   * @param key The key to confirm the type of the handle.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isValidHandle = <T = any> (handle: Handle, key?: HandleKey<T>) => {
    // Get the handle descriptor
    // and check its validity.
    const descriptor = handleMap[handle]
    if (descriptor == null || typeof descriptor !== 'object') {
      return false
    }

    return key != null
      ? key === descriptor.key
      : true
  }

  /**
   * Gets the descriptor of a handle, optionally confirming its type.
   */
  interface GetDescriptor {
    /**
     * Gets the descriptor of a handle.
     * @param handle The handle from which to get a descriptor.
     */
    (handle: Handle): AnyDescriptor
    /**
     * Gets the descriptor of a handle and confirms its type.
     * @param handle The handle from which to get a descriptor.
     * @param key The key to confirm the handle type.
     */
    <T> (handle: Handle, key: HandleKey<T>): Descriptor<T>
  }

  /**
   * Gets the descriptor of a handle, optionally confirming its type.
   * @param handle The handle from which to get a descriptor.
   * @param key An optional key to confirm the handle type.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDescriptor: GetDescriptor = <T = any> (handle: Handle, key?: HandleKey<T>) => {
    // Get the handle descriptor
    // and check its validity.
    const descriptor = handleMap[handle]
    if (descriptor == null || typeof descriptor !== 'object') {
      throw new ReferenceError('Invalid handle')
    }

    if (key == null) {
      return descriptor
    }

    if (descriptor.key !== key) {
      throw new TypeError('Wrong handle')
    }

    return descriptor
  }

  /**
   * Creates a new handle, with the given type key, resource, and clean up routine.
   * @param key A key used to identify and validate the type of the handle.
   * @param resource A resource that will be attached to the handle.
   * @param close A callback to clean up the resource attached to the handle when it closes.
   */
  const createHandle = <T> (key: HandleKey<T>, resource: T, close?: Close<T>) => {
    // Get the handle value and ensure
    // there is no handle exhaustion.
    const handle = nextFree
    if (handle === kMaxHandles) {
      throw new Error('Out of handles')
    }

    // Ensure the handle is not already in use,
    // indicating a possible map corruption.
    const opaque = handleMap[handle]
    if (typeof opaque !== 'number') {
      throw new Error('Handle map corrupt: tNF!=N')
    }

    // Record the next free and put the
    // descriptor in the map so the
    // handle can be closed.
    nextFree = opaque
    handleMap[handle] = { key, resource, close: close ?? (() => undefined) }

    return handle as Handle
  }

  /**
   * Opens a handle to access its attached resource.
   * @param key The handle key that tags the handle type.
   * @param handle The handle to open.
   */
  const openHandle = <T> (key: HandleKey<T>, handle: Handle) => {
    // Get the handle descriptor
    // and check the resource.
    const descriptor = getDescriptor(handle, key)
    if (descriptor.resource == null) {
      throw new ReferenceError('Invalid handle')
    }

    return descriptor.resource // as T
  }

  /**
   * Closes a handle and cleans up its resource.
   * @param handle The handle to close.
   */
  const freeHandle = async (handle: Handle) => {
    // Get the handle descriptor
    // and check the resource.
    const descriptor = getDescriptor(handle)
    if (descriptor.resource == null) {
      throw new ReferenceError('Invalid handle')
    }

    // Attempt to close the resource.
    // If it fails to close, it
    // must throw an error or
    // be silent.
    await descriptor.close(descriptor.resource)

    // Now, point the next free to the
    // handle just closed, and update
    // the next free to point to
    // said handle.
    handleMap[handle] = nextFree
    nextFree = handle
  }

  /**
   * Closes all handles on shutdown.
   */
  const shutDown = async () => {
    await Promise.all(
      handleMap.map(async handle => {
        if (typeof handle === 'object') {
          await handle.close(handle.resource)
        } else {
          await Promise.resolve()
        }
      })
    )
  }

  return {
    kNullHandle,
    isValidHandle,
    createHandle,
    openHandle,
    freeHandle,
    shutDown
  }
})

export default useHandles

// TODO Would be nice to watch for page reloads and closes to free handles in use by that page.
