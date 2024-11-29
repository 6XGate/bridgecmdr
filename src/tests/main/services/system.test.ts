import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import type { Mock } from 'vitest'

let execaSpy: Mock

let stdout = ''
let stderr = ''
let error = null as null | Error

beforeAll(() => {
  vi.mock('electron-log')

  execaSpy = vi.fn()
  vi.doMock('execa', () => ({
    execa: execaSpy
  }))
})

beforeEach(() => {
  stdout = ''
  stderr = ''
  error = null

  execaSpy.mockImplementation(async () =>
    error == null ? await Promise.resolve({ stdout, stderr, exitCode: stderr ? 1 : 0 }) : await Promise.reject(error)
  )
})

describe('powerOff', () => {
  test('success', async () => {
    stdout = 'shutting down'
    const system = (await import('../../../main/services/system')).default()

    await expect(system.powerOff()).resolves.toBeUndefined()
    expect(execaSpy).toBeCalledWith('dbus-send', [
      '--system',
      '--print-reply',
      '--dest=org.freedesktop.login1',
      '/org/freedesktop/login1',
      'org.freedesktop.login1.Manager.PowerOff',
      'boolean:false'
    ])

    execaSpy.mockClear()
    await expect(system.powerOff(false)).resolves.toBeUndefined()
    expect(execaSpy).toBeCalledWith('dbus-send', [
      '--system',
      '--print-reply',
      '--dest=org.freedesktop.login1',
      '/org/freedesktop/login1',
      'org.freedesktop.login1.Manager.PowerOff',
      'boolean:false'
    ])

    execaSpy.mockClear()
    await expect(system.powerOff(true)).resolves.toBeUndefined()
    expect(execaSpy).toBeCalledWith('dbus-send', [
      '--system',
      '--print-reply',
      '--dest=org.freedesktop.login1',
      '/org/freedesktop/login1',
      'org.freedesktop.login1.Manager.PowerOff',
      'boolean:true'
    ])
  })

  test('execa failed', async () => {
    error = new Error('ENOENT: dbus-send not found')
    const system = (await import('../../../main/services/system')).default()

    await expect(system.powerOff()).rejects.toThrow(error)
    expect(execaSpy).toBeCalledWith('dbus-send', [
      '--system',
      '--print-reply',
      '--dest=org.freedesktop.login1',
      '/org/freedesktop/login1',
      'org.freedesktop.login1.Manager.PowerOff',
      'boolean:false'
    ])
  })

  test('command failed', async () => {
    stderr = 'Permission denied'
    const system = (await import('../../../main/services/system')).default()

    await expect(system.powerOff()).rejects.toThrow(stderr)
    expect(execaSpy).toBeCalledWith('dbus-send', [
      '--system',
      '--print-reply',
      '--dest=org.freedesktop.login1',
      '/org/freedesktop/login1',
      'org.freedesktop.login1.Manager.PowerOff',
      'boolean:false'
    ])
  })
})
