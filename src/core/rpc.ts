import { Base64 } from 'js-base64'
import { SuperJSON } from 'superjson'
import { Attachment } from './attachments'

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

  return SuperJSON
}
