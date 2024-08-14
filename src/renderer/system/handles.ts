import useBridgedApi from './bridged'

export default function useHandles() {
  const { freeHandle, freeAllHandles } = useBridgedApi()

  globalThis.addEventListener('beforeunload', (ev) => {
    if (ev.defaultPrevented) return
    freeAllHandles().catch((e: unknown) => {
      console.error(e)
    })
  })

  return {
    freeHandle
  }
}
