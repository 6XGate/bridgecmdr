import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import Logger from 'electron-log'
import { WebSocketServer } from 'ws'
import useAppConfig from './info/config'
import { useAppRouter } from './routes/router'
import { getServerUrl } from '@/url'

function startWebSocketServer(url: URL, host: string, port: number) {
  // TODO: Authentication via the IPC, later we'll implement a proper authentication model.

  process.env['WS_NO_UTF_8_VALIDATE'] = '1'

  const wss = new WebSocketServer({ host, port })

  wss.on('listening', () => {
    Logger.info(`RPC server at ${url}`)
  })

  const handler = applyWSSHandler({ wss, router: useAppRouter() })

  process.on('exit', () => {
    handler.broadcastReconnectNotification()
    wss.close()
  })

  process.on('SIGTERM', () => {
    handler.broadcastReconnectNotification()
    wss.close()
  })
}

function startHttpServer(url: URL, host: string, port: number) {
  // TODO: Authentication via the IPC, later we'll implement a proper authentication model.

  const server = createHTTPServer({
    router: useAppRouter()
  })

  server.server.on('listening', () => {
    Logger.info(`RPC server at ${url}`)
  })

  server.listen(port, host)
  process.on('exit', () => {
    server.server.close()
  })

  process.on('SIGTERM', () => {
    server.server.close()
  })
}

export default function useApiServer() {
  const config = useAppConfig()
  const url = new URL(config.rpcUrl)
  const [host, port, protocol] = getServerUrl(url, 7180)

  if (protocol === 'http:') startHttpServer(url, host, port)
  if (protocol === 'ws:') startWebSocketServer(url, host, port)
}
