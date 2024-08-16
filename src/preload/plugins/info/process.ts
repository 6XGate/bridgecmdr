import type { ProcessData } from '../../api'

export function useProcessData() {
  const data = {
    appleStore: process.mas || undefined,
    arch: process.arch,
    argv: Object.freeze(process.argv),
    argv0: process.argv[0] ?? '',
    env: { ...process.env },
    execPath: process.execPath,
    platform: process.platform,
    resourcesPath: process.resourcesPath,
    sandboxed: process.sandboxed || undefined,
    type: process.type,
    version: process.version,
    versions: process.versions,
    windowsStore: process.windowsStore || undefined
  } satisfies ProcessData

  return data
}
