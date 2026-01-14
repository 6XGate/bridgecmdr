package org.sleepingcats.core.settings

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences

class PreferencesDataStore(
  ds: DataStore<Preferences>,
) : DataStore<Preferences> by ds
