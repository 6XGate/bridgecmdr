import { ipcRenderer } from 'electron'
import { memo } from 'radash'
import { useIpc } from '../support'
import type { Handle, LevelApi, Messanger } from '../api'
import type { IpcRendererEvent } from 'electron'

const useLevelApi = memo(function useLevelApi() {
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
})

export default useLevelApi
