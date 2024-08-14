import { notImplemented } from './reactor'
import type { ContextBridge } from 'electron'

export class MockContextBridge implements ContextBridge {
  exposeInIsolatedWorld = notImplemented()

  exposeInMainWorld(apiKey: string, api: unknown): void {
    if (apiKey === 'process') return // Don't need to polyfill the process.
    globalThis[apiKey as never] = api as never
  }
}
