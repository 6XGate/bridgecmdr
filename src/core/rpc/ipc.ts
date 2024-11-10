import type { IpcMainInvokeEvent } from 'electron'

export const theRpcChannel = 'trpc:msg'

export interface CreateContextOptions {
  event: IpcMainInvokeEvent
}
