export class Attachment extends Uint8Array {
  readonly name
  readonly type

  static async fromFile(file: File) {
    return new Attachment(file.name, file.type, await file.arrayBuffer())
  }

  static async fromPouchAttachment(name: string, attachment: PouchDB.Core.FullAttachment) {
    if (Buffer.isBuffer(attachment.data)) {
      return new Attachment(name, attachment.content_type, attachment.data)
    }

    if (attachment.data instanceof Blob) {
      return new Attachment(name, attachment.content_type, await attachment.data.arrayBuffer())
    }

    const textEncoder = new TextEncoder()
    return new Attachment(name, attachment.content_type, textEncoder.encode(attachment.data))
  }

  constructor(name: string, type: string, data: ArrayBufferLike) {
    super(data)
    this.name = name
    this.type = type
  }
}
