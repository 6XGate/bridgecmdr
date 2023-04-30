<script setup lang="ts">
import { mdiCamera, mdiClose, mdiVideoInputHdmi } from '@mdi/js'
import videoInputHdmiIcon from '@mdi/svg/svg/video-input-hdmi.svg'
import { useObjectUrl, useVModel } from '@vueuse/core'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useErrors } from '@/helpers/errors'
import { isNotNullish } from '@/helpers/filters'
import { useRules, useValidation } from '@/helpers/validation'
import { useDialogs, useSourceDialog } from '@/modals/dialogs'
import { useSources } from '@/system/source'
import type { I18nSchema } from '@/locales/locales'
import type { Source, NewSource } from '@/system/source'

const props = defineProps({
  // eslint-disable-next-line vue/no-unused-properties -- useVModel
  visible: Boolean
})

const emit = defineEmits<{
  (on: 'update:visible', value: boolean): void
  (on: 'confirm', value: Source): void
  (on: 'fail', error: Error): void
}>()

const dialogs = useDialogs()
const { t } = useI18n<I18nSchema>()
const { toError } = useErrors()

const sources = useSources()
const source = ref<NewSource>(sources.blank())

const files = ref<File[]>([])
const file = computed(() => files.value[0])
const image = useObjectUrl(file)
watch(file, value => { v$.image.$model = value?.name ?? null })

// v-model
const isVisible = useVModel(props, 'visible', emit)

const confirm = async () => {
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

const cancelIfConfirmed = async () => {
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

const cancel = () => {
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
        <VBtn :icon="mdiClose" @click="cancelIfConfirmed"/>
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
        <VTextField v-model="v$.title.$model" :label="t('label.name')"
                    :placeholder="t('placeholder.required')"
                    v-bind="getStatus(v$.title)"/>
        <VFileInput v-model="files" :label="t('label.image')" accept="image/*" prepend-icon=""
                    :placeholder="t('placeholder.required')" :prepend-inner-icon="mdiCamera"
                    v-bind="getStatus(v$.title)"/>
        <div class="d-flex justify-center">
          <VCard variant="outlined" max-width="128px" rounded="lg">
            <VIcon v-if="image == null" size="128px" :icon="mdiVideoInputHdmi"/>
            <VImg v-else width="128px" max-height="128px" aspect-ratio="1/1"
                  :src="image" :lazy-src="videoInputHdmiIcon"/>
          </VCard>
        </div>
      </VForm>
    </VCardText>
    <VCardActions v-if="!isFullscreen">
      <VSpacer/>
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
