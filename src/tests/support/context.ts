import { notImplemented } from './reactor'
import type { ContextBridge } from 'electron'

export class MockContextBridge implements ContextBridge {
  exposeInIsolatedWorld = notImplemented()

  exposeInMainWorld(apiKey: string, api: unknown): void {
    globalThis[apiKey as never] = api as never
  }
}
