import { createRouter, createWebHashHistory } from 'vue-router'
import GeneralPage from '../pages/GeneralPage.vue'
import MainDashboard from '../pages/MainDashboard.vue'
import SettingsPage from '../pages/SettingsPage.vue'
import SourceList from '../pages/SourceList.vue'
import SourcePage from '../pages/SourcePage.vue'
import SwitchList from '../pages/SwitchList.vue'
import type { RouteRecordRaw } from 'vue-router'

const routes = [
  { name: 'index', path: '/', component: MainDashboard },
  { name: 'settings', path: '/settings', component: SettingsPage },
  { name: 'settings-general', path: '/settings/general', component: GeneralPage },
  { name: 'sources', path: '/sources', component: SourceList },
  { name: 'sources-id', path: '/sources/:id', component: SourcePage, props: true },
  { name: 'switches', path: '/switches', component: SwitchList }
] satisfies RouteRecordRaw[]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
