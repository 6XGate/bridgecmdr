import { z } from 'zod'

/** Defines the Desktop Entry file data type schemas. */
const useEntry = () => {
  const Boolean = z.coerce.boolean()
  const String = z.string()
  const StringList = z.string().transform(v => v.split(';'))
  const Type = z.enum(['Application', 'Link', 'Directory'])
  const Version = z.string().regex(/^\d+\.\d+/u)
  const Url = z.string().url()

  const Any = z.union([Boolean, String])

  const Section = z.record(Any)

  return {
    Section,
    Boolean,
    String,
    StringList,
    Type,
    Version,
    Url,
    Any
  }
}

/** Desktop Entry file data type schemas. */
export const Entry = useEntry()

/** Basic entry. */
export type BaseEntry = z.infer<typeof BaseEntry>
/** Basic Zod schema for an entry. */
export const BaseEntry = z.object({
  // Type: Entry.Type.default('Application'),
  Version: Entry.Version.optional(),
  Name: Entry.String.min(1),
  GenericName: Entry.String.optional(),
  NoDisplay: Entry.Boolean.optional(),
  Comment: Entry.String.optional(),
  Icon: Entry.String.optional(),
  Hidden: Entry.Boolean.optional(),
  OnlyShowIn: Entry.StringList.optional(),
  NotShowIn: Entry.StringList.optional()
})

/** Application entry. */
export type ApplicationEntry = z.infer<typeof ApplicationEntry>
/** Zod schema for an Application entry. */
export const ApplicationEntry = BaseEntry.extend({
  Type: z.literal('Application'),
  TryExec: Entry.String.optional(),
  Exec: Entry.String.optional(),
  Path: Entry.String.optional(),
  Terminal: Entry.Boolean.optional(),
  Actions: Entry.StringList.optional(),
  MimeType: Entry.StringList.optional(),
  Categories: Entry.StringList.optional(),
  Implements: Entry.StringList.optional(),
  Keywords: Entry.StringList.optional(),
  StartupNotify: Entry.String.optional(),
  StartupWMClass: Entry.String.optional(),
  PrefersNonDefaultGPU: Entry.Boolean.optional(),
  SingleMainWindow: Entry.Boolean.optional()
}).catchall(Entry.Any)

/** Link entry. */
export type LinkEntry = z.infer<typeof LinkEntry>
/** Basic Zod schema for a Link entry. */
export const LinkEntry = BaseEntry.extend({
  Type: z.literal('Link'),
  URL: Entry.Url
}).catchall(Entry.Any)

/** Directory entry. */
export type DirectoryEntry = z.infer<typeof DirectoryEntry>
/** Basic Zod schema for a Directory entry. */
export const DirectoryEntry = BaseEntry.extend({
  Type: z.literal('Directory')
}).catchall(Entry.Any)

/** Desktop entry. */
export type DesktopEntry = z.infer<typeof DesktopEntry>
/** Basic Zod schema for a Desktop Entry. */
export const DesktopEntry = z.union([ApplicationEntry, LinkEntry, DirectoryEntry])

/** Parsed Desktop entry file. */
export type DesktopEntryFile = z.infer<typeof DesktopEntryFile>
/** Basic Zod schema for Desktop Entry files. Does not validate all information only basic types. */
export const DesktopEntryFile = z.object({
  'Desktop Entry': DesktopEntry
  // TODO: Actions
}).catchall(Entry.Section)

/** Makes sure the desktop structure is ready for INI serialization, joining arrays. */
export const readyEntry = (file: DesktopEntryFile) => {
  for (const section of Object.values(file)) {
    for (const [key, value] of Object.entries(section)) {
      if (Array.isArray(value)) {
        section[key] = value.map(v => String(v)).join(';')
      }
    }
  }

  return file
}
