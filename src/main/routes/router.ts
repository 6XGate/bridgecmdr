import { memo } from 'radash'
import useAppInfo from '../services/app'
import { procedure, router } from '../services/rpc/trpc'
import useUserInfo from '../services/user'
import useSourcesRouter from './data/sources'
import useUserStoreRouter from './data/storage'
import useSwitchesRouter from './data/switches'
import useTiesRouter from './data/ties'
import useDriversRouter from './drivers'
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
    storage: useUserStoreRouter(),
    ties: useTiesRouter(),
    switches: useSwitchesRouter(),
    sources: useSourcesRouter(),
    updates: useUpdaterRouter()
  })
)

export type AppRouter = ReturnType<typeof useAppRouter>
