import { createPinia } from 'pinia'
import { createApp } from 'vue'
import BridgeCmdr from './BridgeCmdr.vue'
import { createPersistentStores } from './data/storage'
import router from './plugins/router'
import vuetify from './plugins/vuetify'

import './assets/main.scss'

export const app = createApp(BridgeCmdr)

app.use(createPinia())
app.use(vuetify)
app.use(router)
app.use(createPersistentStores())

app.mount('#app')
