import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import type { Mock } from 'vitest'

const mock = await vi.hoisted(async () => await import('../../support/mock'))

let isEnabled: boolean | undefined
let xdgConfig: string | undefined
let iniFile: string | undefined
let statSpy: Mock<(path: string) => Promise<{ isFile: () => boolean }>>
let mkdirSpy: Mock
let readSpy: Mock
let writeSpy: Mock
let unlinkSpy: Mock
beforeAll(() => {
  vi.mock('electron', mock.electronModule())
  vi.mock('electron-log', mock.electronLogModule)
  vi.mock('node:os', () => ({
    homedir: () => '/home/user'
  }))
  // Disable memoize caching.
  vi.mock('radash', async (original) => ({
    ...(await original()),
    memo: (x: unknown) => x
  }))
  vi.doMock('node:fs/promises', () => {
    statSpy = vi
      .fn(async (path) =>
        (isEnabled ?? false) && path === '/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop'
          ? await Promise.resolve({
              isFile() {
                return true
              }
            })
          : await Promise.reject(new Error('ENOENT'))
      )
      .mockName('fs.stat')
    mkdirSpy = vi.fn().mockResolvedValue(undefined).mockName('fs.mkdir')
    readSpy = vi
      .fn(async () => (iniFile ? await Promise.resolve(iniFile) : await Promise.reject(new Error('ENOENT'))))
      .mockName('fs.readFile')
    writeSpy = vi.fn().mockResolvedValue(undefined).mockName('fs.writeFile')
    unlinkSpy = vi.fn().mockResolvedValue(undefined).mockName('fs.unlink')
    return {
      stat: statSpy,
      mkdir: mkdirSpy,
      readFile: readSpy,
      writeFile: writeSpy,
      unlink: unlinkSpy
    }
  })
  vi.doMock('xdg-basedir', () => ({
    get xdgConfig() {
      return xdgConfig ?? null
    }
  }))
})

beforeEach(() => {
  isEnabled = false
  xdgConfig = undefined
  iniFile = undefined
})

describe('checking enabled', () => {
  test('not enabled', async () => {
    const { default: useStartup } = await import('../../../main/services/startup')
    const startup = useStartup()
    await expect(startup.checkEnabled()).resolves.toBe(false)
    expect(statSpy).toBeCalledWith('/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop')
  })
  test('XDG configuration path defined', async () => {
    isEnabled = true
    xdgConfig = '/home/user/.config'
    const { default: useStartup } = await import('../../../main/services/startup')
    const startup = useStartup()
    await expect(startup.checkEnabled()).resolves.toBe(true)
    expect(statSpy).toBeCalledWith('/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop')
  })
  test('XDG configuration path not defined', async () => {
    isEnabled = true
    const { default: useStartup } = await import('../../../main/services/startup')
    const startup = useStartup()
    await expect(startup.checkEnabled()).resolves.toBe(true)
    expect(statSpy).toBeCalledWith('/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop')
  })
})

describe('enable', () => {
  test('APPIMAGE defined', async () => {
    vi.stubEnv('APPIMAGE', '/home/user/apps/BridgeCmdr')
    const { default: useStartup } = await import('../../../main/services/startup')
    const startup = useStartup()
    await expect(startup.enable()).resolves.toBe(undefined)
    expect(mkdirSpy).toBeCalledWith('/home/user/.config/autostart', { recursive: true })
    expect(writeSpy).toBeCalledWith(
      '/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop',
      '[Desktop Entry]\nType=Application\nName=BridgeCmdr\nExec=/home/user/apps/BridgeCmdr\nNoDisplay=true\nTerminal=false\n',
      { encoding: 'utf-8', mode: 0o644, flag: 'w' }
    )
  })
  test('APPIMAGE not defined', async () => {
    const { default: useStartup } = await import('../../../main/services/startup')
    const startup = useStartup()
    await expect(startup.enable()).resolves.toBe(undefined)
    expect(mkdirSpy).toBeCalledWith('/home/user/.config/autostart', { recursive: true })
    expect(writeSpy).toBeCalledWith(
      '/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop',
      '[Desktop Entry]\nType=Application\nName=BridgeCmdr\nExec=/usr/bin/BridgeCmdr\nNoDisplay=true\nTerminal=false\n',
      { encoding: 'utf-8', mode: 0o644, flag: 'w' }
    )
  })
})

test('disable', async () => {
  const { default: useStartup } = await import('../../../main/services/startup')
  const startup = useStartup()
  await expect(startup.disable()).resolves.toBe(undefined)
  expect(unlinkSpy).toBeCalledWith('/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop')
})

describe('checkUp', () => {
  test('not enabled', async () => {
    const { default: useStartup } = await import('../../../main/services/startup')
    const startup = useStartup()
    await expect(startup.checkUp()).resolves.toBe(undefined)
    expect(statSpy).toBeCalledWith('/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop')
    expect(readSpy).not.toBeCalled()
    expect(mkdirSpy).not.toBeCalled()
    expect(writeSpy).not.toBeCalled()
  })
  test('enabled; right path', async () => {
    isEnabled = true
    iniFile =
      '[Desktop Entry]\nType=Application\nName=BridgeCmdr\nExec=/usr/bin/BridgeCmdr\nNoDisplay=true\nTerminal=false\n'
    const { default: useStartup } = await import('../../../main/services/startup')
    const startup = useStartup()
    await expect(startup.checkUp()).resolves.toBe(undefined)
    expect(statSpy).toBeCalledWith('/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop')
    expect(readSpy).toBeCalledWith('/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop', {
      encoding: 'utf-8'
    })
    expect(mkdirSpy).not.toBeCalled()
    expect(writeSpy).not.toBeCalled()
  })
  test('enabled; file disappears', async () => {
    isEnabled = true
    const { default: useStartup } = await import('../../../main/services/startup')
    const startup = useStartup()
    await expect(startup.checkUp()).resolves.toBe(undefined)
    expect(statSpy).toBeCalledWith('/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop')
    expect(readSpy).toBeCalledWith('/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop', {
      encoding: 'utf-8'
    })
    expect(mkdirSpy).toBeCalledWith('/home/user/.config/autostart', { recursive: true })
    expect(writeSpy).toBeCalledWith(
      '/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop',
      '[Desktop Entry]\nType=Application\nName=BridgeCmdr\nExec=/usr/bin/BridgeCmdr\nNoDisplay=true\nTerminal=false\n',
      { encoding: 'utf-8', mode: 0o644, flag: 'w' }
    )
  })
  test('enabled; bad entry', async () => {
    isEnabled = true
    iniFile = '[Desktop Entry]\nType=Application\nName=BridgeCmdr\nNoDisplay=true\nTerminal=false\n'
    const { default: useStartup } = await import('../../../main/services/startup')
    const startup = useStartup()
    await expect(startup.checkUp()).resolves.toBe(undefined)
    expect(statSpy).toBeCalledWith('/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop')
    expect(readSpy).toBeCalledWith('/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop', {
      encoding: 'utf-8'
    })
    expect(mkdirSpy).toBeCalledWith('/home/user/.config/autostart', { recursive: true })
    expect(writeSpy).toBeCalledWith(
      '/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop',
      '[Desktop Entry]\nType=Application\nName=BridgeCmdr\nExec=/usr/bin/BridgeCmdr\nNoDisplay=true\nTerminal=false\n',
      { encoding: 'utf-8', mode: 0o644, flag: 'w' }
    )
  })
  test('enabled; wrong path', async () => {
    isEnabled = true
    iniFile =
      '[Desktop Entry]\nType=Application\nName=BridgeCmdr\nExec=/home/user/apps/BridgeCmdr\nNoDisplay=true\nTerminal=false\n'
    const { default: useStartup } = await import('../../../main/services/startup')
    const startup = useStartup()
    await expect(startup.checkUp()).resolves.toBe(undefined)
    expect(statSpy).toBeCalledWith('/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop')
    expect(readSpy).toBeCalledWith('/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop', {
      encoding: 'utf-8'
    })
    expect(mkdirSpy).toBeCalledWith('/home/user/.config/autostart', { recursive: true })
    expect(writeSpy).toBeCalledWith(
      '/home/user/.config/autostart/org.sleepingcats.BridgeCmdr.desktop',
      '[Desktop Entry]\nType=Application\nName=BridgeCmdr\nExec=/usr/bin/BridgeCmdr\nNoDisplay=true\nTerminal=false\n',
      { encoding: 'utf-8', mode: 0o644, flag: 'w' }
    )
  })
})
