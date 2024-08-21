import { basename } from 'node:path'
import useIpc from '../support'
import type { SystemApi } from '../api'
import type { FileData } from '@/struct'
import type { OpenDialogOptions } from 'electron'

type ShowOpenDialogMain = (options: OpenDialogOptions) => Promise<FileData[] | null>

const useSystemApi = () => {
  const ipc = useIpc()
  const showOpenDialogMain: ShowOpenDialogMain = ipc.useInvoke('system:showOpenDialog')

  async function showOpenDialog(options: OpenDialogOptions) {
    const files = await showOpenDialogMain(options)
    if (files == null) return null

    return files.map(({ path, buffer, type }) => new File([buffer], basename(path), { type }))
  }

  return {
    powerOff: ipc.useInvoke('system:powerOff'),
    showOpenDialog
  } satisfies SystemApi
}

export default useSystemApi
