import { createHTTPServer } from '@trpc/server/adapters/standalone'
import Logger from 'electron-log'
import useAppConfig from './info/config'
import { useAppRouter } from './routes/router'

function getServerUrl(url: URL): [host: string, port: number] {
  Logger.log(url.pathname)
  if (url.protocol !== 'http:') throw new TypeError('Only HTTP is supported')
  if (url.pathname.length > 1) throw new TypeError('Server must be at the root')
  if (url.search.length > 0) throw new TypeError('Query parameters mean nothing')
  if (url.hash.length > 0) throw new TypeError('Query parameters mean nothing')
  if (url.username.length > 0) throw new TypeError('Username currently unsupported')
  if (url.password.length > 0) throw new TypeError('Password currently unsupported')
  if (url.hostname.length === 0) return ['127.0.0.1', 7180]
  if (url.port.length === 0) return [url.hostname, 7180]

  const port = Number(url.port)
  if (Number.isNaN(port)) throw new TypeError(`${url.port} is not a valid port`)

  return [url.hostname, port]
}

export default function useApiServer() {
  const config = useAppConfig()
  const url = new URL(config.rpcUrl)
  const [host, port] = getServerUrl(url)

  // TODO: Authentication via the IPC, later we'll implement a proper authentication model.

  const httpServer = createHTTPServer({
    router: useAppRouter()
  })

  httpServer.listen(port, host)
  httpServer.server.on('listening', () => {
    Logger.info(`RPC server at ${url}`)
  })

  process.on('exit', () => {
    httpServer.server.close()
  })
}
