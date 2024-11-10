import { contextBridge, ipcRenderer } from 'electron'
import type { TRPCClientIncomingMessage, TRPCClientOutgoingMessage } from '@trpc/server/rpc'
import { theRpcChannel } from '@/rpc/ipc'

/* eslint-disable n/no-process-exit -- No real way to do this otherwise */

export type RpcInterface = ReturnType<typeof exposeRpc>

function exposeRpc() {
  const rpc = {
    sendMessage(operation: TRPCClientOutgoingMessage) {
      ipcRenderer.send(theRpcChannel, operation)
    },
    onMessage(callback: (args: TRPCClientIncomingMessage) => void) {
      ipcRenderer.on(theRpcChannel, (_, args: TRPCClientIncomingMessage) => {
        callback(args)
      })
    }
  }

  contextBridge.exposeInMainWorld('rpc', rpc)
  return rpc
}

exposeRpc()

if (!process.contextIsolated) {
  console.error('Context isolation is not enabled')
  process.exit(1)
}
