import { ipcMain } from 'electron'
import { memo } from 'radash'
import { ipcHandle, logError } from '../utilities'
import type { Handle } from '../../preload/api'
import type { SymbolKey } from '@/keys'
import type { IpcMainInvokeEvent, WebContents } from 'electron'

export type HandleKey<T> = SymbolKey<'handle', T>

/** Close routine for a handle. */
export type Close<T> = (resource: T) => Promise<unknown>

/** Handle transparent structure. */
export interface Descriptor<T> {
  key: HandleKey<T>
  resource: T
  close: Close<T>
}

async function dummyClose() {
  await Promise.resolve()
}

// TODO: Would be nice to watch for page reloads and closes to free handles in use by that page.
// TODO: Register a Handle API for the main process
// interface HandleApi {
//   // Closes a singular handle.
//   close: (h: Handle) => Promise<void>
//   // Closes all handle for a given web content.
//   unload: (sender: WebContent) => Promise<void>
// }
//
// May want to add a reference counting or weakset system for this.

/**
 * Allows the use of an opaque handles for referencing
 * resources by the renderer process.
 */
const useHandles = memo(() => {
  /** The maximum number of handles sans 256. */
  const kMaxHandles = 131072

  /** The NIL/NULL handle. */
  const kNullHandle = 0 as Handle

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prevent need to cast
  type AnyDescriptor = Descriptor<any>

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
  function isValidHandle<T = any>(handle: Handle, key?: HandleKey<T>) {
    // Get the handle descriptor
    // and check its validity.
    const descriptor = handleMap[handle]
    if (descriptor == null || typeof descriptor !== 'object') {
      return false
    }

    return key != null ? key === descriptor.key : true
  }

  /**
   * Gets the descriptor of a handle.
   * @param handle The handle from which to get a descriptor.
   */
  function getDescriptor(handle: Handle): AnyDescriptor
  /**
   * Gets the descriptor of a handle and confirms its type.
   * @param handle The handle from which to get a descriptor.
   * @param key The key to confirm the handle type.
   */
  function getDescriptor<T>(handle: Handle, key: HandleKey<T>): Descriptor<T>
  /** Implementation */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getDescriptor<T = any>(handle: Handle, key?: HandleKey<T>) {
    // Get the handle descriptor
    // and check its validity.
    const descriptor = handleMap[handle]
    if (descriptor == null || typeof descriptor !== 'object') {
      throw logError(new ReferenceError('Invalid handle'))
    }

    if (key == null) {
      return descriptor
    }

    if (descriptor.key !== key) {
      throw logError(new TypeError('Wrong handle'))
    }

    return descriptor
  }

  const handleTrackers = new WeakMap<WebContents, Set<Handle>>()

  function getHandleTracker(sender: WebContents) {
    let handleTracker = handleTrackers.get(sender)
    if (handleTracker != null) return handleTracker
    handleTracker = new Set<Handle>()
    handleTrackers.set(sender, handleTracker)
    return handleTracker
  }

  /**
   * Creates a new handle, with the given type key, resource, and clean up routine.
   * @param event - The event from which the handle is being opened.
   * @param key - A key used to identify and validate the type of the handle.
   * @param resource - A resource that will be attached to the handle.
   * @param close - A callback to clean up the resource attached to the handle when it closes.
   */
  function createHandle<T>(event: IpcMainInvokeEvent, key: HandleKey<T>, resource: T, close?: Close<T>) {
    const { sender } = event

    // Get the handle value and ensure
    // there is no handle exhaustion.
    const handle = nextFree
    if (handle === kMaxHandles) {
      throw logError(new Error('Out of handles'))
    }

    // Ensure the handle is not already in use,
    // indicating a possible map corruption.
    const opaque = handleMap[handle]
    if (typeof opaque !== 'number') {
      throw logError(new Error(`'Handle map corrupt: tNF!=N' ${handle}`))
    }

    // Record the next free and put the
    // descriptor in the map so the
    // handle can be closed.
    nextFree = opaque
    handleMap[handle] = { key, resource, close: close ?? dummyClose }

    // Add the handle to the tracker tree.
    getHandleTracker(sender).add(handle as Handle)

    return handle as Handle
  }

  /**
   * Opens a handle to access its attached resource.
   * @param key - The handle key that tags the handle type.
   * @param handle - The handle to open.
   */
  function openHandle<T>(event: IpcMainInvokeEvent, key: HandleKey<T>, handle: Handle) {
    const { sender } = event

    // Check that the handle belongs to this sender and frame.
    const handles = getHandleTracker(sender)
    if (!handles.has(handle)) {
      throw logError(new ReferenceError('Invalid handle'))
    }

    // Get the handle descriptor
    // and check the resource.
    const descriptor = getDescriptor(handle, key)
    if (descriptor.resource == null) {
      throw logError(new ReferenceError('Invalid handle'))
    }

    return descriptor.resource // as T
  }

  /**
   * Closes a handle and cleans up its resource.
   * @param event - The event from which the handle is being closed.
   * @param handle - The handle to close.
   */
  async function freeHandle(event: IpcMainInvokeEvent, handle: Handle) {
    const { sender } = event

    // Check that the handle belongs to this sender and frame.
    const handles = getHandleTracker(sender)
    if (!handles.has(handle)) {
      throw logError(new ReferenceError('Invalid handle'))
    }

    // Remove the handle from the tracker tree.
    // do this ealier so if any other task
    // tries to close this handle, it
    // cannot see it.
    handles.delete(handle)

    // Get the handle descriptor
    // and check the resource.
    const descriptor = getDescriptor(handle)
    if (descriptor.resource == null) {
      throw logError(new ReferenceError('Invalid handle'))
    }

    // Now, point the next free to the
    // handle just closed, and update
    // the next free to point to
    // said handle.
    handleMap[handle] = nextFree
    nextFree = handle

    // Ensure that any asynchronous call out are at the end,
    // to ensure all changes to the handle map or tracker
    // don't interleave. Attempt to close the resource.
    // If it fails to close, it must throw an
    // error or be silent.
    await descriptor.close(descriptor.resource)

    // // Close the handle.
    // await closeHandle(handle)
  }

  /**
   * Closes all handles in a frame.
   */
  async function freeAllHandle(event: IpcMainInvokeEvent) {
    const { sender } = event

    const handles = getHandleTracker(sender)
    while (handles.size > 0) {
      // Right now, must use a new iterator to always pull the first item.
      // This is to attempt to make this as synchronous as possible
      // until the actual close, allowing the item to be removed
      // before any coroutine pauses for this task cycle.
      const next = handles.values().next()
      if (next.done === true) return

      // eslint-disable-next-line no-await-in-loop -- Must be serialized to prevent
      await freeHandle(event, next.value)
    }
  }

  /**
   * Closes all handles on shutdown.
   *
   * There is no need to handle the free-list or ownership.
   */
  async function shutDown() {
    await Promise.all(
      handleMap.map(async (handle) => {
        if (typeof handle === 'object') {
          await handle.close(handle.resource)
        } else {
          await Promise.resolve()
        }
      })
    )
  }

  ipcMain.handle('handle:free', ipcHandle(freeHandle))
  ipcMain.handle('handle:clean', ipcHandle(freeAllHandle))

  return {
    kNullHandle,
    isValidHandle,
    createHandle,
    openHandle,
    freeHandle,
    freeAllHandle,
    shutDown
  }
})

export default useHandles
