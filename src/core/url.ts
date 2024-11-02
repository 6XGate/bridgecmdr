const protocol = ['http:', 'ws:'] as const
const support = protocol.join(',')
export type Protocol = (typeof protocol)[number]

function isSupportedProtocol(value: unknown): value is Protocol {
  return protocol.includes(value as never)
}

export type ServerSettings = [host: string, port: number, protocol: Protocol]

export function getServerUrl(url: URL, defaultPort: number) {
  if (!isSupportedProtocol(url.protocol)) throw new TypeError(`${url.protocol} is not supported; only ${support}`)
  if (url.pathname.length > 1) throw new TypeError('Server must be at the root')
  if (url.search.length > 0) throw new TypeError('Query parameters mean nothing')
  if (url.hash.length > 0) throw new TypeError('Query parameters mean nothing')
  if (url.username.length > 0) throw new TypeError('Username currently unsupported')
  if (url.password.length > 0) throw new TypeError('Password currently unsupported')
  if (url.hostname.length === 0) return ['127.0.0.1', defaultPort, url.protocol] satisfies ServerSettings
  if (url.port.length === 0) return [url.hostname, defaultPort, url.protocol] satisfies ServerSettings

  const port = Number(url.port)
  if (Number.isNaN(port)) throw new TypeError(`${url.port} is not a valid port`)

  return [url.hostname, port, url.protocol] satisfies ServerSettings
}
