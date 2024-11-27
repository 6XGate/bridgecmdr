import useSourcesDatabase from '../dao/sources'

export async function boot() {
  const sourcesDb = useSourcesDatabase()
  await sourcesDb.normalizeOrder()
}
