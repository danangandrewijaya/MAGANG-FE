<script setup lang="ts">
interface FileUploadResponse {
  id: number
  uid: string
  file_path: string
  file_name: string
  file_type: string
  file_size: number
}

interface Props {
  visible: boolean
  title: string
  progress: number
  currentFile: string
  uploadedFiles: FileUploadResponse[]
  errors: string[]
  showCloseButton: boolean
}

withDefaults(defineProps<Props>(), {
  visible: false,
  title: 'Mengupload File...',
  progress: 0,
  currentFile: '',
  uploadedFiles: () => [],
  errors: () => [],
  showCloseButton: false,
})

defineEmits<{
  close: []
}>()
</script>

<template>
  <VCard
    v-if="visible"
    class="mx-auto"
    max-width="400"
    prepend-icon="bx-upload"
  >
    <VCardTitle>{{ title }}</VCardTitle>
    <VCardText>
      <div class="mb-4">
        <VProgressLinear
          :model-value="progress"
          color="primary"
          height="8"
          rounded
        />
        <div class="d-flex justify-space-between mt-2">
          <span class="text-caption text-medium-emphasis">
            {{ currentFile }}
          </span>
          <span class="text-caption text-medium-emphasis">
            {{ Math.round(progress) }}%
          </span>
        </div>
      </div>
      <div
        v-if="uploadedFiles.length > 0"
        class="mt-4"
      >
        <VDivider class="mb-3" />
        <div class="text-subtitle-2 mb-2">
          File yang berhasil diupload:
        </div>
        <VChip
          v-for="file in uploadedFiles"
          :key="file.id"
          class="me-2 mb-1"
          color="success"
          size="small"
          prepend-icon="bx-check"
        >
          {{ file.file_name }}
        </VChip>
      </div>
      <div
        v-if="errors.length > 0"
        class="mt-4"
      >
        <VDivider class="mb-3" />
        <div class="text-subtitle-2 mb-2 text-error">
          Error:
        </div>
        <VAlert
          v-for="(error, index) in errors"
          :key="index"
          type="error"
          variant="tonal"
          class="mb-2"
          density="compact"
        >
          {{ error }}
        </VAlert>
      </div>
    </VCardText>
    <VCardActions
      v-if="showCloseButton"
      class="justify-end"
    >
      <VBtn
        color="primary"
        @click="$emit('close')"
      >
        Tutup
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<style scoped>
.v-card {
  position: fixed;
  z-index: 1000;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
}
</style>
