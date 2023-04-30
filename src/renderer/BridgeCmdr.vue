<script setup lang='ts'>
import { useTitle } from '@vueuse/core'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import AlertModal from '@/modals/AlertModal.vue'
import ConfirmModal from '@/modals/ConfirmModal.vue'
import useSettings from '@/stores/settings'
import type { I18nSchema } from './locales/locales'

const settings = useSettings()
const theme = useTheme()
watch(() => settings.activeColorScheme, () => {
  theme.global.name.value = settings.activeColorScheme
}, { immediate: true })

const { t } = useI18n<I18nSchema>()

useTitle(t('product'))
</script>

<template>
  <VApp id="bridgecmdr">
    <RouterView v-slot="{ Component: Route, route }">
      <VScrollXTransition leave-absolute>
        <Component :is="Route" :key="route.name"/>
      </VScrollXTransition>
    </RouterView>
  </VApp>
  <!-- Common dialogs -->
  <AlertModal/>
  <ConfirmModal/>
</template>
