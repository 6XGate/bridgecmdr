/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue"

  const Component: DefineComponent<{}, {} , any>
  export default Component
}

declare module 'pouchdb-adapter-leveldb-core' {
  import type { ErrorCallback } from 'abstract-leveldown'

  function LevelPouch (this: Partial<LevelPouch>, options: any, cb: ErrorCallback): void

  interface LevelPouch {
    type: () => string
    valid: () => boolean
    use_prefix?: boolean
    auto_compaction?: boolean
  }

  export = LevelPouch
}

declare namespace PouchDB {
  interface Static {
    adapter: (id: string, obj: any, addToPreferredAdapters: true) => void
  }
}
