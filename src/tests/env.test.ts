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
    const os = await import('node:os')
    const { default: useAppInfo } = await import('../main/info/app')
    const { default: useUserInfo } = await import('../main/info/user')
    const appInfo = useAppInfo()
    const userInfo = useUserInfo()

    expect(appInfo).toStrictEqual({
      name: 'BridgeCmdr==mock==',
      version: '2.0.0==mock=='
    })
    expect(userInfo).toStrictEqual({
      name: os.userInfo().username,
      locale: 'en==mock=='
    })
  })
})
