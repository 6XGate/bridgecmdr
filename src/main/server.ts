import { applyWSSHandler } from '@trpc/server/adapters/ws'
import Logger from 'electron-log'
import { range } from 'radash'
import { WebSocketServer } from 'ws'
import { useAppRouter } from './routes/router'
import { createStandaloneContext } from './services/trpc'

function startWebSocketServer(url: string, host: string, port: number) {
  // TODO: Authentication via the IPC, later we'll implement a proper authentication model.

  process.env['WS_NO_UTF_8_VALIDATE'] = '1'

  const wss = new WebSocketServer({ host, port })

  wss.on('listening', () => {
    Logger.info(`RPC server at ${url}`)
  })

  const handler = applyWSSHandler({ wss, router: useAppRouter(), createContext: createStandaloneContext })

  process.on('exit', () => {
    handler.broadcastReconnectNotification()
    wss.close()
  })

  process.on('SIGTERM', () => {
    handler.broadcastReconnectNotification()
    wss.close()
  })
}

// TODO: Maybe usable for the remote server one day.
// function startHttpServer(url: URL, host: string, port: number) {
//   // TODO: Authentication via the IPC, later we'll implement a proper authentication model.
//
//   const server = createHTTPServer({
//     router: useAppRouter()
//   })
//
//   server.server.on('listening', () => {
//     Logger.info(`RPC server at ${url}`)
//   })
//
//   server.listen(port, host)
//   process.on('exit', () => {
//     server.server.close()
//   })
//
//   process.on('SIGTERM', () => {
//     server.server.close()
//   })
// }

export default function useApiServer() {
  let cause
  const host = '127.0.0.1'
  for (const port of range(7000, 8000)) {
    const url = `ws://${host}:${port}`
    try {
      startWebSocketServer(url, host, port)
      return port
    } catch (err) {
      cause = err
      console.warn(`Unable to bind server to ${url}`, cause)
    }
  }

  throw new Error('No port available for the server within 7000-8000', { cause })
}
