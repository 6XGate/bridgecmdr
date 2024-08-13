import { ipcRenderer } from 'electron'
import useIpc from '../support.js'
import type { Handle, LevelApi, Messanger } from '../api.js'
import type { IpcRendererEvent } from 'electron'

export default function useLevelApi() {
  const ipc = useIpc()

  type GetChannel = (h: Handle) => Promise<`level:${string}`>
  const getChannel: GetChannel = ipc.useInvoke('database:channel')

  const activate = async (handle: Handle, receiver: Messanger): Promise<Messanger> => {
    const channel = await getChannel(handle)

    const received = (_: IpcRendererEvent, message: unknown) => {
      receiver(message)
    }

    ipcRenderer.on(channel, received)
    ipcRenderer.once(`${channel}:close`, () => {
      ipcRenderer.off(channel, received)
    })

    return (message: unknown) => {
      ipcRenderer.send(channel, message)
    }
  }

  return {
    open: ipc.useInvoke('database:open'),
    activate
  } satisfies LevelApi
}
