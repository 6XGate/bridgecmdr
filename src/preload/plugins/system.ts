import { basename } from 'node:path'
import { memo } from 'radash'
import { useIpc } from '../support'
import type { SystemApi } from '../api'
import type { FileData } from '@/struct'
import type { OpenDialogOptions, SaveDialogOptions } from 'electron'

type ShowOpenDialogMain = (options: OpenDialogOptions) => Promise<FileData[] | null>
type SaveFileMain = (file: FileData, options: SaveDialogOptions) => Promise<boolean>

const useSystemApi = memo(function useSystemApi() {
  const ipc = useIpc()

  const openFileMain: ShowOpenDialogMain = ipc.useInvoke('system:openFile')
  async function openFile(options: OpenDialogOptions) {
    const files = await openFileMain(options)
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
    openFile,
    saveFile
  } satisfies SystemApi
})

export default useSystemApi
