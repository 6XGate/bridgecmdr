import { Base64 } from 'js-base64'
import { SuperJSON } from 'superjson'
import { Attachment } from '../attachments'
import { raiseError } from '../error-handling'

export default function useSuperJson() {
  SuperJSON.registerCustom(
    {
      isApplicable: (v) => v instanceof Attachment,
      serialize: (attachment) => ({
        name: attachment.name,
        type: attachment.type,
        data: Base64.fromUint8Array(attachment)
      }),
      deserialize: (attachment) =>
        new Attachment(attachment.name, attachment.type, Base64.toUint8Array(attachment.data))
    },
    'Attachment'
  )

  // HACK: tRPC won't serialize functions; but doesn't filter
  // them out, so IPC throws an error if they are passed.
  // This can also ensure any types with functions
  // won't be returned as seen in the return
  // type information for the router.
  SuperJSON.registerCustom(
    {
      isApplicable: (v): v is () => undefined => typeof v === 'function',
      serialize: (_: () => undefined) => raiseError(() => new TypeError('Functions may not be serialized')),
      deserialize: (_: never) => raiseError(() => new TypeError('Functions may not be serialized'))
    },
    'Function'
  )

  return SuperJSON
}
