import { memo } from 'radash'
import useAppInfo from '../services/app'
import { procedure, router } from '../services/rpc/trpc'
import useUserInfo from '../services/user'
import useDevicesRouter from './data/devices'
import useSourcesRouter from './data/sources'
import useUserStoreRouter from './data/storage'
import useTiesRouter from './data/ties'
import useDriversRouter from './drivers'
import useMigrationRouter from './migration'
import useSerialPortRouter from './ports'
import useStartupRouter from './startup'
import useSystemRouter from './system'
import useUpdaterRouter from './updater'

export const useAppRouter = memo(() =>
  router({
    // Informational routes
    appInfo: procedure.query(useAppInfo),
    userInfo: procedure.query(useUserInfo),
    // Functional service routes
    ports: useSerialPortRouter(),
    startup: useStartupRouter(),
    system: useSystemRouter(),
    drivers: useDriversRouter(),
    // Data service routes
    migration: useMigrationRouter(),
    storage: useUserStoreRouter(),
    ties: useTiesRouter(),
    devices: useDevicesRouter(),
    sources: useSourcesRouter(),
    updates: useUpdaterRouter()
  })
)

export type AppRouter = ReturnType<typeof useAppRouter>
