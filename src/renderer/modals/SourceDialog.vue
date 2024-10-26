<script setup lang="ts">
import { mdiClose } from '@mdi/js'
import { useVModel } from '@vueuse/core'
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ReplacableImage from '../components/ReplacableImage.vue'
import { useRules, useValidation } from '../helpers/validation'
import { useSources } from '../system/source'
import { useDialogs, useSourceDialog } from './dialogs'
import type { I18nSchema } from '../locales/locales'
import type { NewSource, Source } from '../system/source'
import { isNotNullish } from '@/basics'
import { toError } from '@/error-handling'

const props = defineProps<{
  // eslint-disable-next-line vue/no-unused-properties -- useVModel
  visible?: boolean
}>()

const emit = defineEmits<{
  (on: 'update:visible', value: boolean): void
  (on: 'confirm', value: Source): void
  (on: 'fail', error: Error): void
}>()

const dialogs = useDialogs()
const { t } = useI18n<I18nSchema>()

const sources = useSources()
const source = ref<NewSource>(sources.blank())

const file = ref<File>()
watch(file, (value) => {
  v$.image.$model = value?.name ?? null
})

// v-model
const isVisible = useVModel(props, 'visible', emit)

// TODO: Track confirm or move logic to parent (SourceList).

async function confirm() {
  try {
    const result = await sources.add(source.value, ...[file.value].filter(isNotNullish))
    isVisible.value = false
    emit('confirm', result)
  } catch (e) {
    isVisible.value = false
    await dialogs.error(e)
    emit('fail', toError(e))
  }
}

async function cancelIfConfirmed() {
  if (!dirty.value) {
    cancel()

    return
  }

  const yes = await dialogs.confirm({
    message: t('message.discardNew'),
    color: 'primary',
    confirmButton: t('action.discard'),
    cancelButton: t('common.cancel')
  })

  if (yes) {
    cancel()
  }
}

function cancel() {
  isVisible.value = false
}

const { required, minLength } = useRules()
const rules = reactive({
  title: { required, ...minLength(1) },
  image: { required, ...minLength(1) }
})

const { dirty, getStatus, submit, v$ } = useValidation(rules, source, confirm)

const { cardProps, isFullscreen } = useSourceDialog()
</script>

<template>
  <VCard :loading="sources.isBusy" v-bind="cardProps">
    <VToolbar v-if="isFullscreen" :title="t('title')" color="transparent">
      <template #prepend>
        <VBtn :icon="mdiClose" @click="cancelIfConfirmed" />
      </template>
      <template #append>
        <VBtn class="text-none" color="primary" @click="submit">{{ t('action.save') }}</VBtn>
      </template>
    </VToolbar>
    <template v-else>
      <VCardTitle>{{ t('title') }}</VCardTitle>
    </template>
    <VCardText>
      <VForm :disabled="sources.isBusy">
        <VTextField
          v-model="v$.title.$model"
          :label="t('label.name')"
          :placeholder="t('placeholder.required')"
          v-bind="getStatus(v$.title)" />
        <div class="d-flex justify-center">
          <ReplacableImage :image="file" @update="file = $event" />
        </div>
      </VForm>
    </VCardText>
    <VCardActions v-if="!isFullscreen">
      <VSpacer />
      <VBtn class="text-none" @click="cancel">{{ t('action.discard') }}</VBtn>
      <VBtn class="text-none" color="primary" @click="submit">{{ t('action.save') }}</VBtn>
    </VCardActions>
  </VCard>
</template>

<i18n lang="yaml">
en:
  title: Add source
  message:
    discardNew: Do you want to discard this source?
</i18n>
