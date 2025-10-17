<script setup lang="ts">
import { onMounted, ref } from 'vue'
import FilePreview from '@/components/FilePreview.vue'
import { useGqlQuery } from '@/composables/graphql/useGqlQuery'
import { useFileUpload } from '@/composables/useFileUpload'

interface Props {
  mode: 'create' | 'edit'
  providerId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  providerId: null,
})

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const form = ref({
  nama: '',
  npwp: '',
  alamat: '',
  nama_direktur: '',
  email: '',
  telepon: '',
  nama_bank: '',
  nomor_rekening: '',
  nama_rekening: '',
  pengusaha_kena_pajak: '1',
  npwp_rekanan_file: null as File | null,
  referensi_bank_rekanan_file: null as File | null,
})

const formRules = {
  nama: [
    (v: string) => !!v || 'Nama penyedia wajib diisi',
    (v: string) => v.length >= 3 || 'Nama penyedia minimal 3 karakter',
  ],
  alamat: [
    (v: string) => !!v || 'Alamat wajib diisi',
    (v: string) => v.length >= 10 || 'Alamat minimal 10 karakter',
  ],
  email: [
    (v: string) => !!v || 'Email wajib diisi',
    (v: string) => (v.includes('@') && v.includes('.')) || 'Format email tidak valid',
  ],
  telepon: [
    (v: string) => !!v || 'Telepon wajib diisi',
    (v: string) => /^[0-9+\-\s()]+$/.test(v) || 'Format telepon tidak valid',
  ],
  npwp: [
    (v: string) => !!v || 'NPWP wajib diisi',
    (v: string) => v.length === 15 || 'NPWP harus 15 digit',
    (v: string) => /^[0-9.-]+$/.test(v) || 'NPWP hanya boleh berisi angka, titik, dan strip',
  ],
  nama_direktur: [
    (v: string) => !!v || 'Nama direktur wajib diisi',
    (v: string) => v.length >= 3 || 'Nama direktur minimal 3 karakter',
  ],
}

const formValid = ref(false)
const loading = ref(false)

// File upload functionality
const { uploadFile, validateFile } = useFileUpload()

const npwpRekananId = DOKUMEN_NPWP_REKANAN_ID
const referensiBankId = DOKUMEN_REFERENSI_BANK_ID

// File upload status tracking
const fileUploadStatus = ref({
  npwp_rekanan: { uploading: false, uploaded: false, error: null as string | null },
  referensi_bank: { uploading: false, uploaded: false, error: null as string | null },
})

const originalData = ref({
  nama: '',
  npwp: '',
  alamat: '',
  nama_direktur: '',
  email: '',
  telepon: '',
  nama_bank: '',
  nomor_rekening: '',
  nama_rekening: '',
  pengusaha_kena_pajak: '1',
  npwp_rekanan_file: null as File | null,
  referensi_bank_rekanan_file: null as File | null,
})

// Query untuk mengambil data provider jika mode edit
const { data: providerData, refetch: fetchProvider } = useGqlQuery(
  'penyedia',
  'first',
  { id: props.providerId },
  { firstExecution: false },
)

// Load data jika mode edit
onMounted(async () => {
  if (props.mode === 'edit' && props.providerId) {
    loading.value = true
    try {
      await fetchProvider({ id: props.providerId })
      if (providerData.value) {
        console.log('Loaded provider data:', providerData.value)

        const loadedData = {
          nama: providerData.value.nama_penyedia || '',
          npwp: providerData.value.npwp || '',
          alamat: providerData.value.alamat || '',
          nama_direktur: providerData.value.nama_direktur || '',
          email: providerData.value.email || '',
          telepon: providerData.value.no_telepon || '',
          nama_bank: providerData.value.nama_bank || '',
          nomor_rekening: providerData.value.nomor_rekening || '',
          nama_rekening: providerData.value.nama_rekening || '',
          pengusaha_kena_pajak: '1',
          npwp_rekanan_file: null,
          referensi_bank_rekanan_file: null,
        }

        // Cek jika ada file di backend
        if (providerData.value.dokument && Array.isArray(providerData.value.dokument)) {
          // console.log('Provider documents:', providerData.value.dokument)

          const npwp = providerData.value.dokument.find((d: any) => d.jenisDokumen?.kode === DOKUMEN_NPWP_REKANAN_KODE)
          if (npwp)
            loadedData.npwp_rekanan_file = npwp
          const bank = providerData.value.dokument.find((d: any) => d.jenisDokumen?.kode === DOKUMEN_REFERENSI_BANK_KODE)
          if (bank)
            loadedData.referensi_bank_rekanan_file = bank
        }

        form.value = { ...loadedData }
        originalData.value = { ...loadedData }
      }
    }
    catch (error) {
      console.error('Error loading provider data:', error)
    }
    finally {
      loading.value = false
    }
  }
})

const handleSubmit = async () => {
  if (!formValid.value) {
    console.log('Form validation failed')

    return
  }

  const formData = {
    nama_penyedia: form.value.nama,
    alamat: form.value.alamat,
    email: form.value.email,
    no_telepon: form.value.telepon,
    npwp: form.value.npwp,
    nama_direktur: form.value.nama_direktur,

    // is_active: true,

    // BE belum ada
    // nama_bank: form.value.nama_bank,
    // nomor_rekening: form.value.nomor_rekening,
    // nama_rekening: form.value.nama_rekening,
    // pengusaha_kena_pajak: form.value.pengusaha_kena_pajak,
  }

  // Include file data for parent to handle upload
  const submitData = {
    providerData: formData,
    files: {
      npwp_rekanan: form.value.npwp_rekanan_file,
      referensi_bank: form.value.referensi_bank_rekanan_file,
    },
  }

  emit('submit', submitData)
}

const handleCancel = () => {
  emit('cancel')
}

const handleReset = () => {
  if (props.mode === 'edit' && originalData.value)
    form.value = { ...originalData.value }
}

// Expose function for file upload after provider creation
const uploadProviderDocuments = async (penyediaId: number) => {
  const uploadResults = []

  // Upload NPWP file if exists
  if (form.value.npwp_rekanan_file) {
    fileUploadStatus.value.npwp_rekanan.uploading = true
    fileUploadStatus.value.npwp_rekanan.error = null

    const result = await uploadFile(
      form.value.npwp_rekanan_file,
      'penyediaId',
      penyediaId,
      npwpRekananId,
      'NPWP Rekanan',
    )

    fileUploadStatus.value.npwp_rekanan.uploading = false

    if (result) {
      fileUploadStatus.value.npwp_rekanan.uploaded = true
      uploadResults.push(result)
    }
    else {
      fileUploadStatus.value.npwp_rekanan.error = 'Gagal mengupload file NPWP'
    }
  }

  // Upload referensi bank file if exists
  if (form.value.referensi_bank_rekanan_file) {
    fileUploadStatus.value.referensi_bank.uploading = true
    fileUploadStatus.value.referensi_bank.error = null

    const result = await uploadFile(
      form.value.referensi_bank_rekanan_file,
      'penyediaId',
      penyediaId,
      referensiBankId,
      'Referensi Bank Rekanan',
    )

    fileUploadStatus.value.referensi_bank.uploading = false

    if (result) {
      fileUploadStatus.value.referensi_bank.uploaded = true
      uploadResults.push(result)
    }
    else {
      fileUploadStatus.value.referensi_bank.error = 'Gagal mengupload file referensi bank'
    }
  }

  return uploadResults
}

// Handle file change and trigger auto-upload if in edit mode
const handleFileChange = async (files: File[] | null, fieldName: string) => {
  // Get the first file if files array exists
  const file = files && files.length > 0 ? files[0] : null

  // Update form field
  if (fieldName === 'npwp_rekanan')
    form.value.npwp_rekanan_file = file
  else if (fieldName === 'referensi_bank')
    form.value.referensi_bank_rekanan_file = file

  // Set status pending, jangan upload di sini
  if (file) {
    fileUploadStatus.value[fieldName as keyof typeof fileUploadStatus.value] = {
      uploading: false,
      uploaded: false,
      error: null,
    }
  }
}

// Handle explicit file removal
const handleFileRemove = (fieldName: string) => {
  // Clear the file
  if (fieldName === 'npwp_rekanan')
    form.value.npwp_rekanan_file = null
  else if (fieldName === 'referensi_bank')
    form.value.referensi_bank_rekanan_file = null

  // Reset the upload status
  fileUploadStatus.value[fieldName as keyof typeof fileUploadStatus.value] = {
    uploading: false,
    uploaded: false,
    error: null,
  }
}

// Expose functions to parent component
defineExpose({
  uploadProviderDocuments,
})
</script>

<template>
  <VCard :title="mode === 'edit' ? 'Edit Penyedia' : 'Tambah Penyedia'">
    <VCardText>
      <VForm
        v-model="formValid"
        @submit.prevent="handleSubmit"
      >
        <VRow>
          <!-- Nama Penyedia -->
          <VCol
            cols="12"
            class="pb-2"
          >
            <VRow no-gutters>
              <VCol
                cols="12"
                md="3"
                class="d-flex align-items-center"
              >
                <label
                  class="v-label text-body-2 text-high-emphasis"
                  for="nama"
                >
                  Nama Penyedia
                  <span class="text-error">*</span>
                </label>
              </VCol>
              <VCol
                cols="12"
                md="9"
              >
                <VTextField
                  id="nama"
                  v-model="form.nama"
                  :rules="formRules.nama"
                  :loading="loading"
                  placeholder="Masukkan nama penyedia"
                  persistent-placeholder
                  density="compact"
                  required
                />
              </VCol>
            </VRow>
          </VCol>

          <!-- NPWP -->
          <VCol
            cols="12"
            class="pb-2"
          >
            <VRow no-gutters>
              <VCol
                cols="12"
                md="3"
                class="d-flex align-items-center"
              >
                <label
                  class="v-label text-body-2 text-high-emphasis"
                  for="npwp"
                >
                  NPWP
                  <span class="text-error">*</span>
                </label>
              </VCol>
              <VCol
                cols="12"
                md="9"
              >
                <VTextField
                  id="npwp"
                  v-model="form.npwp"
                  :rules="formRules.npwp"
                  :loading="loading"
                  placeholder="00.000.000.0-000.000"
                  persistent-placeholder
                  density="compact"
                  required
                />
              </VCol>
            </VRow>
          </VCol>

          <!-- Alamat -->
          <VCol
            cols="12"
            class="pb-2"
          >
            <VRow no-gutters>
              <VCol
                cols="12"
                md="3"
                class="d-flex align-items-center"
              >
                <label
                  class="v-label text-body-2 text-high-emphasis"
                  for="alamat"
                >
                  Alamat
                  <span class="text-error">*</span>
                </label>
              </VCol>
              <VCol
                cols="12"
                md="9"
              >
                <VTextarea
                  id="alamat"
                  v-model="form.alamat"
                  :rules="formRules.alamat"
                  :loading="loading"
                  placeholder="Masukkan alamat lengkap"
                  persistent-placeholder
                  density="compact"
                  rows="3"
                  required
                />
              </VCol>
            </VRow>
          </VCol>

          <!-- Direktur Perusahaan -->
          <VCol
            cols="12"
            class="pb-2"
          >
            <VRow no-gutters>
              <VCol
                cols="12"
                md="3"
                class="d-flex align-items-center"
              >
                <label
                  class="v-label text-body-2 text-high-emphasis"
                  for="nama_direktur"
                >
                  Direktur Perusahaan
                  <span class="text-error">*</span>
                </label>
              </VCol>
              <VCol
                cols="12"
                md="9"
              >
                <VTextField
                  id="nama_direktur"
                  v-model="form.nama_direktur"
                  :rules="formRules.nama_direktur"
                  :loading="loading"
                  placeholder="Masukkan nama direktur"
                  persistent-placeholder
                  density="compact"
                  required
                />
              </VCol>
            </VRow>
          </VCol>

          <!-- Email -->
          <VCol
            cols="12"
            class="pb-2"
          >
            <VRow no-gutters>
              <VCol
                cols="12"
                md="3"
                class="d-flex align-items-center"
              >
                <label
                  class="v-label text-body-2 text-high-emphasis"
                  for="email"
                >
                  Email
                  <span class="text-error">*</span>
                </label>
              </VCol>
              <VCol
                cols="12"
                md="9"
              >
                <VTextField
                  id="email"
                  v-model="form.email"
                  type="email"
                  :rules="formRules.email"
                  :loading="loading"
                  placeholder="contoh@email.com"
                  persistent-placeholder
                  density="compact"
                  required
                />
              </VCol>
            </VRow>
          </VCol>

          <!-- Nomor Telpon -->
          <VCol
            cols="12"
            class="pb-2"
          >
            <VRow no-gutters>
              <VCol
                cols="12"
                md="3"
                class="d-flex align-items-center"
              >
                <label
                  class="v-label text-body-2 text-high-emphasis"
                  for="telepon"
                >
                  Nomor Telpon
                  <span class="text-error">*</span>
                </label>
              </VCol>
              <VCol
                cols="12"
                md="9"
              >
                <VTextField
                  id="telepon"
                  v-model="form.telepon"
                  :rules="formRules.telepon"
                  :loading="loading"
                  placeholder="+62 123 456 7890"
                  persistent-placeholder
                  density="compact"
                  required
                />
              </VCol>
            </VRow>
          </VCol>

          <!-- Nama Bank Penyedia -->
          <VCol
            cols="12"
            class="pb-2"
          >
            <VRow no-gutters>
              <VCol
                cols="12"
                md="3"
                class="d-flex align-items-center"
              >
                <label
                  class="v-label text-body-2 text-high-emphasis"
                  for="nama_bank"
                >
                  Nama Bank Penyedia
                </label>
              </VCol>
              <VCol
                cols="12"
                md="9"
              >
                <VTextField
                  id="nama_bank"
                  v-model="form.nama_bank"
                  :loading="loading"
                  placeholder="Masukkan nama bank"
                  persistent-placeholder
                  density="compact"
                />
              </VCol>
            </VRow>
          </VCol>

          <!-- Nomor Rekening -->
          <VCol
            cols="12"
            class="pb-2"
          >
            <VRow no-gutters>
              <VCol
                cols="12"
                md="3"
                class="d-flex align-items-center"
              >
                <label
                  class="v-label text-body-2 text-high-emphasis"
                  for="nomor_rekening"
                >
                  Nomor Rekening
                </label>
              </VCol>
              <VCol
                cols="12"
                md="9"
              >
                <VTextField
                  id="nomor_rekening"
                  v-model="form.nomor_rekening"
                  :loading="loading"
                  placeholder="Masukkan nomor rekening"
                  persistent-placeholder
                  density="compact"
                />
              </VCol>
            </VRow>
          </VCol>

          <!-- Nama Rekening -->
          <VCol
            cols="12"
            class="pb-2"
          >
            <VRow no-gutters>
              <VCol
                cols="12"
                md="3"
                class="d-flex align-items-center"
              >
                <label
                  class="v-label text-body-2 text-high-emphasis"
                  for="nama_rekening"
                >
                  Nama Rekening
                </label>
              </VCol>
              <VCol
                cols="12"
                md="9"
              >
                <VTextField
                  id="nama_rekening"
                  v-model="form.nama_rekening"
                  :loading="loading"
                  placeholder="Masukkan nama rekening"
                  persistent-placeholder
                  density="compact"
                />
              </VCol>
            </VRow>
          </VCol>

          <!-- Pengusaha Kena Pajak -->
          <VCol
            cols="12"
            class="pb-2"
          >
            <VRow no-gutters>
              <VCol
                cols="12"
                md="3"
                class="d-flex align-items-center"
              >
                <label
                  class="v-label text-body-2 text-high-emphasis"
                  for="pengusaha_kena_pajak"
                >
                  Pengusaha Kena Pajak
                </label>
              </VCol>
              <VCol
                cols="12"
                md="9"
              >
                <VRadioGroup
                  v-model="form.pengusaha_kena_pajak"
                  :loading="loading"
                  inline
                  density="compact"
                >
                  <VRadio
                    class="me-4"
                    label="Ya"
                    value="1"
                  />
                  <VRadio
                    label="Tidak"
                    value="0"
                  />
                </VRadioGroup>
              </VCol>
            </VRow>
          </VCol>

          <!-- File Upload Section - Only show in edit mode -->
          <template v-if="mode === 'edit'">
            <!-- NPWP Rekanan -->
            <VCol
              cols="12"
              class="pb-2"
            >
              <VRow no-gutters>
                <VCol
                  cols="12"
                  md="3"
                  class="d-flex align-items-center"
                >
                  <label
                    class="v-label text-body-2 text-high-emphasis"
                    for="npwp_rekanan_file"
                  >
                    NPWP Rekanan
                  </label>
                </VCol>
                <VCol
                  cols="12"
                  md="9"
                >
                  <VFileInput
                    id="npwp_rekanan_file"
                    :model-value="form.npwp_rekanan_file ? [form.npwp_rekanan_file] : []"
                    :loading="loading"
                    placeholder="Pilih file NPWP"
                    prepend-icon=""
                    prepend-inner-icon="bx-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    density="compact"
                    show-size
                    :multiple="false"
                    @update:model-value="handleFileChange($event, 'npwp_rekanan')"
                  />

                  <!-- File Preview for NPWP Rekanan -->
                  <div
                    v-if="form.npwp_rekanan_file"
                    class="mt-3"
                  >
                    <FilePreview
                      :file="Array.isArray(form.npwp_rekanan_file) ? form.npwp_rekanan_file[0] : form.npwp_rekanan_file"
                      :status="fileUploadStatus.npwp_rekanan.uploading ? 'uploading' : fileUploadStatus.npwp_rekanan.uploaded ? 'success' : fileUploadStatus.npwp_rekanan.error ? 'error' : 'pending'"
                      :error="fileUploadStatus.npwp_rekanan.error"
                      @remove="handleFileRemove('npwp_rekanan')"
                    />
                  </div>
                </VCol>
              </VRow>
            </VCol>

            <!-- Referensi Bank Rekanan -->
            <VCol
              cols="12"
              class="pb-2"
            >
              <VRow no-gutters>
                <VCol
                  cols="12"
                  md="3"
                  class="d-flex align-items-center"
                >
                  <label
                    class="v-label text-body-2 text-high-emphasis"
                    for="referensi_bank_rekanan_file"
                  >
                    Referensi Bank Rekanan
                  </label>
                </VCol>
                <VCol
                  cols="12"
                  md="9"
                >
                  <VFileInput
                    id="referensi_bank_rekanan_file"
                    :model-value="form.referensi_bank_rekanan_file ? [form.referensi_bank_rekanan_file] : []"
                    :loading="loading"
                    placeholder="Pilih file referensi bank"
                    prepend-icon=""
                    prepend-inner-icon="bx-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    density="compact"
                    show-size
                    :multiple="false"
                    @update:model-value="handleFileChange($event, 'referensi_bank')"
                  />

                  <!-- File Preview for Referensi Bank Rekanan -->
                  <div
                    v-if="form.referensi_bank_rekanan_file"
                    class="mt-3"
                  >
                    <FilePreview
                      :file="Array.isArray(form.referensi_bank_rekanan_file) ? form.referensi_bank_rekanan_file[0] : form.referensi_bank_rekanan_file"
                      :status="fileUploadStatus.referensi_bank.uploading ? 'uploading' : fileUploadStatus.referensi_bank.uploaded ? 'success' : fileUploadStatus.referensi_bank.error ? 'error' : 'pending'"
                      :error="fileUploadStatus.referensi_bank.error"
                      @remove="handleFileRemove('referensi_bank')"
                    />
                  </div>
                </VCol>
              </VRow>
            </VCol>
          </template>

          <!-- Action Buttons -->
          <VCol
            cols="12"
            class="pt-4"
          >
            <VRow no-gutters>
              <VCol
                cols="12"
                md="3"
              />
              <VCol
                cols="12"
                md="9"
              >
                <VBtn
                  type="submit"
                  color="primary"
                  class="me-4"
                  :disabled="!formValid || loading"
                  :loading="loading"
                  @click="handleSubmit"
                >
                  <VIcon
                    start
                    icon="bx-save"
                  />
                  Simpan
                </VBtn>
                <VBtn
                  v-if="mode === 'edit'"
                  color="warning"
                  variant="tonal"
                  class="me-4"
                  :disabled="loading"
                  @click="handleReset"
                >
                  <VIcon
                    start
                    icon="bx-reset"
                  />
                  Reset
                </VBtn>
                <VBtn
                  color="secondary"
                  variant="tonal"
                  :disabled="loading"
                  @click="handleCancel"
                >
                  <VIcon
                    start
                    icon="bx-x-circle"
                  />
                  Batal
                </VBtn>
              </VCol>
            </VRow>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>
