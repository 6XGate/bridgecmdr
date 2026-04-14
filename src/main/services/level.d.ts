import type { AbstractIterator, AbstractLevelDOWN } from 'abstract-leveldown'
import type { LevelDown } from 'leveldown'
import type { LevelUp } from 'levelup'

type AbstractStorageDown = AbstractLevelDOWN<string, string>
interface AbstractStorageIterator extends AbstractIterator<string, string> {
  [Symbol.asyncIterator](): AsyncIterableIterator<[key: string, value: string]>
}

type LevelStorage = LevelUp<AbstractStorageDown, AbstractStorageIterator>

export const useLevelDb: () => {
  leveldown: (name: string) => LevelDown
  levelup: (name: string) => Promise<LevelStorage>
}

export const useLevelAdapter: () => PouchDB.Plugin<PouchDB.Static>
