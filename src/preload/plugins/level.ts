import useIpc from '@preload/support'
import type { LevelProxyApi } from '@preload/api'

const useLevelProxyApi = () => {
  const ipc = useIpc()

  return {
    connect: ipc.useInvoke('leveldb:connect'),
    open: ipc.useInvoke('leveldb:open'),
    close: ipc.useInvoke('leveldb:close'),
    get: ipc.useInvoke('leveldb:get'),
    getMany: ipc.useInvoke('leveldb:getMany'),
    put: ipc.useInvoke('leveldb:put'),
    del: ipc.useInvoke('leveldb:del'),
    batch: ipc.useInvoke('leveldb:batch'),
    clear: ipc.useInvoke('leveldb:clear'),
    approximateSize: ipc.useInvoke('leveldb:approximateSize'),
    compactRange: ipc.useInvoke('leveldb:compactRange'),
    iterator: ipc.useInvoke('leveldb:iterator'),
    iteration: {
      next: ipc.useInvoke('leveldb:iterator:next'),
      end: ipc.useInvoke('leveldb:iterator:end'),
      seek: ipc.useInvoke('leveldb:iterator:seek')
    }
  } satisfies LevelProxyApi
}

export default useLevelProxyApi
