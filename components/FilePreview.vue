<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// Backend file object type (from API)
interface BackendFile {
  id: number
  uid: string
  file_path: string
  file_name: string
  file_type: string
  file_size: number
  documentUrl?: string // Optional, if the backend provides a direct URL
}

interface Props {
  file: File | BackendFile | null
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  file: null,
  status: 'pending',
  error: null,
})

defineEmits<{
  remove: []
}>()

const previewUrl = ref<string | null>(null)
const loadingPreview = ref(false)

// Computed: is this a File object or backend file object?
const isBackendFile = computed(() =>
  props.file && typeof (props.file as any).file_path === 'string',
)

const fileName = computed(() => {
  if (!props.file)
    return ''
  if (isBackendFile.value)
    return (props.file as BackendFile).file_name

  return (props.file as File).name
})

const fileType = computed(() => {
  if (!props.file)
    return ''
  if (isBackendFile.value)
    return (props.file as BackendFile).file_type

  return (props.file as File).type
})

const fileSize = computed(() => {
  if (!props.file)
    return 0
  if (isBackendFile.value)
    return (props.file as BackendFile).file_size

  return (props.file as File).size
})

const fileDownloadUrl = computed(() => {
  if (!props.file || !isBackendFile.value)
    return null

  // You may need to adjust this if your backend requires a full URL
  return (props.file as BackendFile).documentUrl || (props.file as BackendFile).file_path
})

const getFileIcon = (type: string): string => {
  if (type.startsWith('image/'))
    return 'bx-image'
  if (type === 'application/pdf')
    return 'bx-file-pdf'

  return 'bx-file'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0)
    return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

const isImage = (type: string): boolean => {
  return type.startsWith('image/')
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'default'
    case 'uploading':
      return 'info'
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    default:
      return 'default'
  }
}

const getStatusText = (status: string): string => {
  // Jika file dari backend (sudah terupload), jangan tampilkan status "Menunggu"
  if (isBackendFile.value) {
    switch (status) {
      case 'success':
        return 'Berhasil'
      case 'error':
        return 'Gagal'
      default:
        return '' // Jangan tampilkan status apapun (termasuk "Menunggu")
    }
  }

  // Untuk file lokal (belum upload)
  switch (status) {
    case 'pending':
      return 'Menunggu submit'
    case 'uploading':
      return 'Mengupload...'
    case 'success':
      return 'Berhasil'
    case 'error':
      return 'Gagal'
    default:
      return 'Tidak diketahui'
  }
}

// Watch for file changes to update preview if needed
watch(
  () => props.file,
  async newFile => {
    previewUrl.value = null
    loadingPreview.value = false
    if (newFile && !isBackendFile.value && isImage(fileType.value)) {
      loadingPreview.value = true
      try {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

        const reader = new FileReader()

        reader.onload = e => {
          previewUrl.value = e.target?.result as string
          loadingPreview.value = false
        }

        reader.onerror = () => {
          loadingPreview.value = false
        }

        reader.readAsDataURL(newFile as File)
      }
      catch (error) {
        loadingPreview.value = false
        console.error('Error loading preview:', error)
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <VCard
    v-if="file"
    class="file-preview"
    variant="outlined"
  >
    <VCardTitle class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <VIcon
          :icon="getFileIcon(fileType)"
          class="me-2"
        />
        <template v-if="isBackendFile">
          <a
            v-if="fileDownloadUrl"
            :href="fileDownloadUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary text-decoration-underline"
          >
            {{ fileName }}
          </a>
          <span v-else>{{ fileName }}</span>
        </template>
        <template v-else>
          {{ fileName }}
        </template>
      </div>
      <VBtn
        size="small"
        variant="text"
        color="error"
        icon="bx-trash"
        @click="$emit('remove')"
      />
    </VCardTitle>
    <VCardText>
      <div class="d-flex align-center justify-space-between">
        <div>
          <div class="text-caption text-medium-emphasis">
            Ukuran: {{ formatFileSize(fileSize) }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Tipe: {{ fileType }}
          </div>
        </div>
        <VChip
          :color="getStatusColor(status)"
          size="small"
          variant="tonal"
        >
          {{ getStatusText(status) }}
        </VChip>
      </div>

      <!-- Image preview for image files (only for File, not backend file) -->
      <div
        v-if="!isBackendFile && isImage(fileType)"
        class="mt-3"
      >
        <div
          v-if="loadingPreview"
          class="d-flex justify-center align-center pa-4"
        >
          <VProgressCircular
            indeterminate
            size="24"
            color="primary"
          />
          <span class="ms-2 text-caption">Memuat preview...</span>
        </div>
        <VImg
          v-else-if="previewUrl"
          :src="previewUrl"
          :alt="fileName"
          max-height="200"
          contain
          class="rounded"
        />
      </div>

      <!-- Error message -->
      <VAlert
        v-if="error"
        type="error"
        variant="tonal"
        class="mt-3"
        density="compact"
      >
        {{ error }}
      </VAlert>
    </VCardText>
  </VCard>
</template>

<style scoped>
.file-preview {
  max-inline-size: 400px;
}
</style>
