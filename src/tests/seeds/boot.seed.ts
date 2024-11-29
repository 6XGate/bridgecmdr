import { alphabetical, map } from 'radash'
import useSourcesDatabase from '../../main/dao/sources'
import type { Source } from '../../main/dao/sources'
import { Attachment } from '@/attachments'

export async function seedForBoot() {
  const sourcesDao = useSourcesDatabase()

  await sourcesDao.clear()

  const file = new File([Buffer.from('test')], 'test.txt', { type: 'text/plain' })
  const image = await Attachment.fromFile(file)

  const sources = (await map(
    [
      { order: 0.5, title: 'NES', image: image.name },
      { order: 1, title: 'SNES', image: image.name },
      { order: 2.25, title: 'N64', image: image.name }
    ],
    async (doc) => await sourcesDao.add(doc, image)
  )) as [Source, Source, Source]

  return {
    // DAOs
    sourcesDao,
    // Added documents
    sources: alphabetical(sources, (item) => item._id) as typeof sources
  }
}
