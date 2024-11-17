import { beforeEach, expect, test, vi } from 'vitest'

const mock = await vi.hoisted(async () => await import('../../support/mock'))

beforeEach(() => {
  vi.mock('electron', mock.electronModule())
  vi.mock('electron-log', mock.electronLogModule)
})

test('ready', async () => {
  const { default: useAppInfo } = await import('../../../main/services/app')
  const appInfo = useAppInfo()

  expect(appInfo).toStrictEqual({
    name: 'BridgeCmdr==mock==',
    version: '2.0.0==mock=='
  })
})
