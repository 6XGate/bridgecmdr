import { beforeEach, describe, expect, test, vi } from 'vitest'

const mock = await vi.hoisted(async () => await import('../../support/mock'))

describe('correct setup', () => {
  beforeEach(() => {
    vi.mock('electron', mock.electronModule())
    vi.mock('electron-log', mock.electronLogModule)
  })

  test('ready', async () => {
    const os = await import('node:os')
    const { default: useUserInfo } = await import('../../../main/services/user')
    const userInfo = useUserInfo()

    expect(userInfo).toStrictEqual({
      name: os.userInfo().username,
      locale: 'en==mock=='
    })
  })
})
