import { LevelDown } from 'leveldown'
import { LevelUp } from 'levelup'

export const useLevelDb: () => {
  leveldown: (name: string) => LevelDown
  levelup: (name: string) => Promise<LevelUp<LevelDown>>
}

export const useLevelAdapter: () => PouchDB.Plugin<PouchDB.Static>
