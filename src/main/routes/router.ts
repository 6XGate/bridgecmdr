import { memo } from 'radash'
import useAppInfo from '../info/app'
import useUserInfo from '../info/user'
import { createCallerFactory, procedure, router } from '../services/trpc'
import useSourcesRouter from './data/sources'
import useUserStoreRouter from './data/storage'
import useSwitchesRouter from './data/switches'
import useTiesRouter from './data/ties'
import useDriversRouter from './drivers'
import useSerialPortRouter from './ports'
import useStartupRouter from './startup'

export const useAppRouter = memo(() =>
  router({
    // Informational routes
    appInfo: procedure.query(useAppInfo),
    userInfo: procedure.query(useUserInfo),
    // Functional service routes
    ports: useSerialPortRouter(),
    startup: useStartupRouter(),
    drivers: useDriversRouter(),
    // Data service routes
    storage: useUserStoreRouter(),
    ties: useTiesRouter(),
    switches: useSwitchesRouter(),
    sources: useSourcesRouter()
  })
)

export type AppRouter = ReturnType<typeof useAppRouter>
export const createCaller = createCallerFactory(useAppRouter())
