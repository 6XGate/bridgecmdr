import type { AbstractLevelDOWN } from 'abstract-leveldown'
import type { LevelUp } from 'levelup'

export const useLevelDb: () => {
  connectSync: (name: string) => AbstractLevelDOWN
  connect: (name: string) => Promise<AbstractLevelDOWN>
  levelup: (name: string) => Promise<LevelUp>
}

export const useLevelAdapter: () => PouchDB.Plugin<PouchDB.Static>
