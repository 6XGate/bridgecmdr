import type levelup from 'levelup'

export const useLevelDb: () => {
  connect: (name: string) => Promise<levelup.LevelUp>
}

export const useLevelAdapter: () => PouchDB.Plugin<PouchDB.Static>
