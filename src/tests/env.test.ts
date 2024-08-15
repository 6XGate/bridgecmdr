import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const mock = await vi.hoisted(async () => await import('./support/mock'))

describe('bad setup', () => {
  beforeEach(() => {
    vi.mock(import('electron'), mock.electronModule)
    mock.electronProcess()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  test('context isolation off', async () => {
    const logger = mock.console()

    vi.spyOn(process, 'contextIsolated', 'get').mockImplementation(() => false)
    await expect(import('../preload/index')).rejects.toThrowError('process.exit unexpectedly called with "1"')
    expect(logger.error).toBeCalledWith('Context isolation is not enabled')
  })

  test('missing environment', () => {
    expect(() => globalThis.app.name).toThrowError(TypeError)
    expect(() => globalThis.app.version).toThrowError(TypeError)
    expect(() => globalThis.user.name).toThrowError(TypeError)
    expect(() => globalThis.user.locale).toThrowError(TypeError)
  })

  test('app info', async () => {
    const { default: useAppInfo } = await import('../preload/plugins/info/app')

    expect(() => useAppInfo()).toThrowError('Missing appInfo.name')
    vi.stubEnv('app_name_', 'BridgeCmdr')
    expect(() => useAppInfo()).toThrowError('Missing appInfo.version')
  })

  test('user info', async () => {
    const { default: useUserInfo } = await import('../preload/plugins/info/user')

    vi.stubEnv('USER', '') // HACK: Only way to clear a variables.
    expect(() => useUserInfo()).toThrowError('Missing user info')
    vi.stubEnv('USER', 'Charles')
    expect(() => useUserInfo()).toThrowError('Missing locale info')
  })
})

describe('correct setup', () => {
  beforeEach(async () => {
    vi.mock(import('electron'), mock.electronModule)
    await mock.globalEventTarget()
    mock.electronProcess()
    mock.bridgeCmdrEnv()
  })

  afterEach(() => {
    vi.resetModules()
  })

  test('ready', async () => {
    await import('../preload/index')

    expect(globalThis.app).toStrictEqual({
      name: 'BridgeCmdr',
      version: '2.0.0'
    })
    expect(globalThis.user).toStrictEqual({
      name: 'Charles',
      locale: 'en'
    })
  })
})
