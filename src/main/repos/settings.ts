import { memo } from 'radash'
import { useKysely } from './database'
import type { ColumnType } from 'kysely'

export interface SettingTable {
  name: ColumnType<string, string, undefined>
  value: string
}

class SettingsRepository {
  async getSetting(name: string): Promise<string | null> {
    const record = await useKysely().selectFrom('settings').select('value').where('name', '=', name).executeTakeFirst()

    return record ? record.value : null
  }

  async setSetting(name: string, value: string): Promise<void> {
    await useKysely().replaceInto('settings').values({ name, value }).execute()
  }

  async removeSetting(name: string): Promise<void> {
    await useKysely().deleteFrom('settings').where('name', '=', name).execute()
  }

  async clearSettings(): Promise<void> {
    await useKysely().deleteFrom('settings').execute()
  }
}

export const useSettingsRepository = memo(() => new SettingsRepository())
