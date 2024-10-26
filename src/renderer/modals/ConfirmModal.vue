<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfirmModal } from './dialogs'
import type { I18nSchema } from '../locales/locales'

const { isRevealed, onReveal, confirm, cancel } = useConfirmModal()
const { t } = useI18n<I18nSchema>()

const title = ref<string>()
const message = ref('')
const confirmButton = ref(t('common.yes'))
const cancelButton = ref(t('common.no'))
const color = ref('primary')

onReveal(function handleReveal(config) {
  title.value = config.title
  message.value = config.message
  confirmButton.value = config.confirmButton ?? t('common.yes')
  cancelButton.value = config.cancelButton ?? t('common.no')
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
        <VBtn class="text-none" :text="cancelButton" @click="cancel" />
        <VBtn class="text-none" :text="confirmButton" :color="color" @click="confirm" />
      </VCardActions>
    </VCard>
  </VDialog>
</template>
