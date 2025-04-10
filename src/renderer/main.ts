import { createPinia } from 'pinia'
import { createApp } from 'vue'
import BridgeCmdr from './BridgeCmdr.vue'
import i18n from './plugins/i18n'
import router from './plugins/router'
import vuetify from './plugins/vuetify'

import './assets/main.scss'

export const app = createApp(BridgeCmdr)

app.use(createPinia())
app.use(vuetify)
app.use(router)
app.use(i18n)

app.mount('#root')
