import { memo } from 'radash'
import useAppInfo from '../info/app'
import useUserInfo from '../info/user'
import { createCallerFactory, procedure, router } from '../services/trpc'
import useSourcesRouter from './data/sources'
import useUserStoreRouter from './data/storage'
import useSwitchesRouter from './data/switches'
import useTiesRouter from './data/ties'
import useSerialPortRouter from './ports'

export const useAppRouter = memo(function useAppRouter() {
  return router({
    // Informational routes
    appInfo: procedure.query(useAppInfo),
    userInfo: procedure.query(useUserInfo),
    // Functional service routes
    ports: useSerialPortRouter(),
    // Data service routes
    storage: useUserStoreRouter(),
    ties: useTiesRouter(),
    switches: useSwitchesRouter(),
    sources: useSourcesRouter()
  })
})

export type AppRouter = ReturnType<typeof useAppRouter>
export const createCaller = createCallerFactory(useAppRouter())
