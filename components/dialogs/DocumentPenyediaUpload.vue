<script setup lang="ts">
import { ref } from 'vue'
import FilePreview from '@/components/FilePreview.vue'
import { useFileUpload } from '@/composables/useFileUpload'

interface Props {
  visible: boolean
  providerId: number | null
  providerName: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  providerId: null,
  providerName: '',
})

const emit = defineEmits<{
  close: []
  uploaded: [count: number]
}>()

const { uploadMultipleFiles, validateFile } = useFileUpload()

const uploading = ref(false)
const validatingFile = ref(false)

const npwpRekananId = DOKUMEN_NPWP_REKANAN_ID
const referensiBankId = DOKUMEN_REFERENSI_BANK_ID

const files = ref({
  npwp_rekanan: null as File | null,
  referensi_bank: null as File | null,
})

const fileUploadStatus = ref({
  npwp_rekanan: { uploaded: false, error: null as string | null },
  referensi_bank: { uploaded: false, error: null as string | null },
})

// File validation on file selection
const handleFileValidation = async (fileList: File[] | null, fieldName: string) => {
  if (!fileList || fileList.length === 0) {
    files.value[fieldName as keyof typeof files.value] = null
    fileUploadStatus.value[fieldName as keyof typeof fileUploadStatus.value].error = null

    return
  }

  const file = fileList[0]

  if (!file) {
    fileUploadStatus.value[fieldName as keyof typeof fileUploadStatus.value].error = null

    return
  }

  validatingFile.value = true

  try {
    // Use requestAnimationFrame to make validation non-blocking
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

    const validationError = validateFile(file)

    if (validationError) {
      fileUploadStatus.value[fieldName as keyof typeof fileUploadStatus.value].error = validationError
      files.value[fieldName as keyof typeof files.value] = null
    }
    else {
      fileUploadStatus.value[fieldName as keyof typeof fileUploadStatus.value].error = null
      files.value[fieldName as keyof typeof files.value] = file
    }
  }
  finally {
    validatingFile.value = false
  }
}

const handleClose = () => {
  // Reset form
  files.value = {
    npwp_rekanan: null,
    referensi_bank: null,
  }
  fileUploadStatus.value = {
    npwp_rekanan: { uploaded: false, error: null },
    referensi_bank: { uploaded: false, error: null },
  }
  emit('close')
}

const handleUpload = async () => {
  if (!props.providerId || uploading.value)
    return

  const filesToUpload = []

  if (files.value.npwp_rekanan) {
    filesToUpload.push({
      file: files.value.npwp_rekanan,
      type: npwpRekananId,
      name: 'NPWP Rekanan',
    })
  }

  if (files.value.referensi_bank) {
    filesToUpload.push({
      file: files.value.referensi_bank,
      type: referensiBankId,
      name: 'Referensi Bank Rekanan',
    })
  }

  if (filesToUpload.length === 0) {
    showSnackbar('Pilih minimal satu dokumen untuk diunggah', 'warning')

    return
  }

  uploading.value = true

  try {
    const uploadResults = await uploadMultipleFiles(filesToUpload, 'penyediaId', props.providerId)

    if (uploadResults.length > 0) {
      showSnackbar(`Berhasil mengunggah ${uploadResults.length} dokumen`, 'success')
      emit('uploaded', uploadResults.length)
      handleClose()
    }
    else {
      showSnackbar('Gagal mengunggah dokumen', 'error')
    }
  }
  catch (error) {
    console.error('Error uploading files:', error)
    showSnackbar(`Gagal mengunggah dokumen: ${error}`, 'error')
  }
  finally {
    uploading.value = false
  }
}

const removeFile = (fieldName: string) => {
  files.value[fieldName as keyof typeof files.value] = null
  fileUploadStatus.value[fieldName as keyof typeof fileUploadStatus.value].error = null
}
</script>

<template>
  <VDialog
    :model-value="visible"
    max-width="600"
    persistent
    @update:model-value="!$event && handleClose()"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <span>Upload Dokumen Penyedia</span>
        <VBtn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="handleClose"
        />
      </VCardTitle>

      <VCardText>
        <div class="mb-4">
          <VAlert
            type="info"
            variant="tonal"
            density="compact"
          >
            Upload dokumen untuk penyedia: <strong>{{ providerName }}</strong>
          </VAlert>
        </div>

        <!-- NPWP Rekanan -->
        <div class="mb-6">
          <VLabel class="mb-2 text-body-2 text-high-emphasis">
            NPWP Rekanan
          </VLabel>
          <VFileInput
            :model-value="files.npwp_rekanan ? [files.npwp_rekanan] : []"
            placeholder="Pilih file NPWP"
            prepend-icon=""
            prepend-inner-icon="bx-upload"
            accept=".pdf,.jpg,.jpeg,.png"
            density="compact"
            show-size
            :loading="validatingFile"
            :disabled="validatingFile"
            @update:model-value="handleFileValidation($event, 'npwp_rekanan')"
          />

          <!-- File Preview for NPWP Rekanan -->
          <div
            v-if="files.npwp_rekanan"
            class="mt-3"
          >
            <FilePreview
              :file="files.npwp_rekanan"
              :status="fileUploadStatus.npwp_rekanan.error ? 'error' : 'pending'"
              :error="fileUploadStatus.npwp_rekanan.error"
              @remove="removeFile('npwp_rekanan')"
            />
          </div>
        </div>

        <!-- Referensi Bank Rekanan -->
        <div class="mb-6">
          <VLabel class="mb-2 text-body-2 text-high-emphasis">
            Referensi Bank Rekanan
          </VLabel>
          <VFileInput
            :model-value="files.referensi_bank ? [files.referensi_bank] : []"
            placeholder="Pilih file referensi bank"
            prepend-icon=""
            prepend-inner-icon="bx-upload"
            accept=".pdf,.jpg,.jpeg,.png"
            density="compact"
            show-size
            :loading="validatingFile"
            :disabled="validatingFile"
            @update:model-value="handleFileValidation($event, 'referensi_bank')"
          />

          <!-- File Preview for Referensi Bank Rekanan -->
          <div
            v-if="files.referensi_bank"
            class="mt-3"
          >
            <FilePreview
              :file="files.referensi_bank"
              :status="fileUploadStatus.referensi_bank.error ? 'error' : 'pending'"
              :error="fileUploadStatus.referensi_bank.error"
              @remove="removeFile('referensi_bank')"
            />
          </div>
        </div>
      </VCardText>

      <VCardActions class="justify-end">
        <VBtn
          variant="outlined"
          @click="handleClose"
        >
          Batal
        </VBtn>
        <VBtn
          color="primary"
          :loading="uploading"
          :disabled="!files.npwp_rekanan && !files.referensi_bank"
          @click="handleUpload"
        >
          <VIcon start>
            bx-upload
          </VIcon>
          Upload Dokumen
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
