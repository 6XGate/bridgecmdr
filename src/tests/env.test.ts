import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const mock = await vi.hoisted(async () => await import('./support/mock'))

describe('correct setup', () => {
  beforeEach(() => {
    vi.mock(import('electron'), mock.electronModule)
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
