import { expect, test } from 'vitest'
import { readyEntry } from '../../../main/services/desktop'
import type { DesktopEntryFile } from '../../../main/services/desktop'

test('readyEntry', () => {
  const entry: DesktopEntryFile = {
    'Desktop Entry': {
      Type: 'Application',
      Name: 'BridgeCmdr',
      Exec: 'test path',
      NoDisplay: true,
      Terminal: false,
      Categories: ['utilities', 'accessories']
    }
  }

  expect(readyEntry(entry)).toStrictEqual({
    'Desktop Entry': {
      Type: 'Application',
      Name: 'BridgeCmdr',
      Exec: 'test path',
      NoDisplay: true,
      Terminal: false,
      Categories: 'utilities;accessories'
    }
  })
})
