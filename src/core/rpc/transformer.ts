import { SuperJSON } from 'superjson'
import { Attachment } from '../attachments'
import { raiseError } from '../error-handling'
import { fromBase64, toBase64 } from '@/base64'

function useSuperJsonCommon() {
  const superJson = new SuperJSON()

  // HACK: tRPC and SuperJSON won't serialize functions; but
  // doesn't filter them out, so the IPC throws an error
  // if they are passed. They are also not passable via
  // HTTP JSON serialization. This will ensure any
  // types with functions won't be usable with
  // routes, as functions will trigger an
  // Error with this transformation.
  superJson.registerCustom(
    {
      isApplicable: (v): v is () => undefined => typeof v === 'function',
      serialize: (_: () => undefined) => raiseError(() => new TypeError('Functions may not be serialized')),
      deserialize: (_: never) => raiseError(() => new TypeError('Functions may not be serialized'))
    },
    'Function'
  )

  return superJson
}

/**
 * Sets up SuperJSON for use over Electron IPC.
 *
 * This will attempt to translate data into a form compatible with the limited
 * structuralClone ability of Electron's IPC channels. This means most
 * builtin objects and a  very limited set of host objects may be
 * passed directly through without translation.
 */
export function useIpcJson() {
  const superJson = useSuperJsonCommon()
  superJson.registerCustom(
    {
      isApplicable: (v) => v instanceof Attachment,
      serialize: (attachment) => ({
        name: attachment.name,
        type: attachment.type,
        data: new Uint8Array(attachment.buffer) as never
      }),
      deserialize: (attachment) => new Attachment(attachment.name, attachment.type, attachment.data)
    },
    'Attachment'
  )

  return superJson
}

/**
 * Sets up SuperJSON for use over HTTP.
 *
 * This will attempt to translate data into a form compatible with normal JSON.
 * This means only data allowed in regular JSON may be passed, other types
 * of data must be translated into the best possible representation.
 * Binary data will need to be Base64 encoded.
 */
export function useWebJson() {
  const superJson = useSuperJsonCommon()
  superJson.registerCustom(
    {
      isApplicable: (v) => v instanceof Attachment,
      serialize: (attachment) => ({
        name: attachment.name,
        type: attachment.type,
        data: toBase64(attachment)
      }),
      deserialize: (attachment) => new Attachment(attachment.name, attachment.type, fromBase64(attachment.data))
    },
    'Attachment'
  )

  return superJson
}
