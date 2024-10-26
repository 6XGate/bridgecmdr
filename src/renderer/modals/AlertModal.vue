<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAlertModal } from './dialogs'
import type { I18nSchema } from '../locales/locales'

const { isRevealed, onReveal, confirm } = useAlertModal()
const { t } = useI18n<I18nSchema>()

const title = ref<string>()
const message = ref('')
const button = ref(t('common.confirm'))
const color = ref<string>()

onReveal(function handleReveal(config) {
  title.value = config.title
  message.value = config.message
  button.value = config.button ?? t('common.confirm')
  color.value = config.color
})
</script>

<template>
  <VDialog v-model="isRevealed" :max-width="640">
    <VCard>
      <template v-if="title != null">
        <VCardTitle>{{ title }}</VCardTitle>
        <VCardText>{{ message }}</VCardText>
      </template>
      <template v-else>
        <VCardText>{{ message }}</VCardText>
      </template>
      <VCardActions class="justify-end">
        <VBtn class="text-none" :text="button" :color="color" @click="confirm" />
      </VCardActions>
    </VCard>
  </VDialog>
</template>
