<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  elevate?: boolean
}

const props = defineProps<Props>()

const flatToolbar = computed(() => ({
  color: 'transparent',
  elevation: 0
}))

const elevatedToolbar = computed(() => ({
  color: undefined as never,
  elevation: props.elevate ? 6 : 0
}))

const toolbar = ref({
  color: 'transparent',
  elevation: 0
})

const handleContentScroll = (e: Event) => {
  if (e.target instanceof HTMLElement) {
    toolbar.value = e.target.scrollTop === 0 ? flatToolbar.value : elevatedToolbar.value
  }
}
</script>

<template>
  <div class="d-flex flex-column h-screen">
    <slot :toolbar="toolbar" :scrolled="handleContentScroll"></slot>
  </div>
</template>
