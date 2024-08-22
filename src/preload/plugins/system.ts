import { basename } from 'node:path'
import useIpc from '../support'
import type { SystemApi } from '../api'
import type { FileData } from '@/struct'
import type { OpenDialogOptions, SaveDialogOptions } from 'electron'

type ShowOpenDialogMain = (options: OpenDialogOptions) => Promise<FileData[] | null>
type SaveFileMain = (file: FileData, options: SaveDialogOptions) => Promise<boolean>

const useSystemApi = () => {
  const ipc = useIpc()

  const showOpenDialogMain: ShowOpenDialogMain = ipc.useInvoke('system:showOpenDialog')
  async function showOpenDialog(options: OpenDialogOptions) {
    const files = await showOpenDialogMain(options)
    if (files == null) return null

    return files.map(({ path, buffer, type }) => new File([buffer], basename(path), { type }))
  }

  const saveFileMain: SaveFileMain = ipc.useInvoke('system:saveFile')
  async function saveFile(file: File, options: SaveDialogOptions) {
    const source = {
      path: file.name,
      buffer: new Uint8Array(await file.arrayBuffer()),
      type: file.type
    } satisfies FileData

    return await saveFileMain(source, options)
  }

  return {
    powerOff: ipc.useInvoke('system:powerOff'),
    showOpenDialog,
    saveFile
  } satisfies SystemApi
}

export default useSystemApi
