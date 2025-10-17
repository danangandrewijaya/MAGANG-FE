<script setup lang="ts">
import { ref } from 'vue'
import DocumentUpload from '@/components/dialogs/DocumentPenyediaUpload.vue'
import PenyediaForm from '@/components/forms/Penyedia.vue'
import { useGqlMutation } from '@/composables/graphql/useGqlMutation'

const { execute: createPenyedia, data: createPenyediaData } = useGqlMutation('penyedia', 'create')

const isSubmitting = ref(false)
const showDocumentDialog = ref(false)
const createdProvider = ref<{ id: number; nama_penyedia: string } | null>(null)
const penyediaFormRef = ref()

const handleSubmit = async (submitData: any) => {
  if (isSubmitting.value)
    return

  isSubmitting.value = true

  try {
    // Extract provider data and files
    const { providerData, files } = submitData

    // Create the provider first
    await createPenyedia({
      data: providerData,
    })

    const result = createPenyediaData.value

    console.log('Provider creation result:', result)

    if (result?.id) {
      showSnackbar('Penyedia berhasil ditambahkan', 'success')

      // Store provider info
      createdProvider.value = {
        id: result.id,
        nama_penyedia: result.nama_penyedia || providerData.nama_penyedia,
      }

      // Upload files if any were selected in the form
      if (penyediaFormRef.value && (files?.npwp_rekanan || files?.referensi_bank)) {
        try {
          const uploadResults = await penyediaFormRef.value.uploadProviderDocuments(result.id)
          if (uploadResults && uploadResults.length > 0)
            showSnackbar(`Berhasil mengunggah ${uploadResults.length} dokumen`, 'success')
        }
        catch (uploadError) {
          console.error('Error uploading documents:', uploadError)
          showSnackbar('Provider berhasil dibuat, tetapi ada masalah saat upload dokumen', 'warning')
        }
      }

      // Show document upload dialog for additional files or if no files were uploaded
      showDocumentDialog.value = true
    }

    // else {
    //   showSnackbar('Gagal menambahkan penyedia', 'error')
    // }
  }
  catch (error) {
    console.error('Error creating provider:', error)
    showSnackbar(`Gagal menambahkan penyedia: ${error}`, 'error')
  }
  finally {
    isSubmitting.value = false
  }
}

const handleDocumentUploaded = (count: number) => {
  showSnackbar(`Berhasil mengunggah ${count} dokumen`, 'success')
  navigateTo('/pengaturan/penyedia')
}

const handleDocumentDialogClose = () => {
  showDocumentDialog.value = false

  // Offer option to navigate back or upload later
  navigateTo('/pengaturan/penyedia')
}

const handleCancel = () => {
  navigateTo('/pengaturan/penyedia')
}
</script>

<template>
  <div>
    <PenyediaForm
      ref="penyediaFormRef"
      mode="create"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />

    <!-- Document Upload Dialog -->
    <DocumentUpload
      :visible="showDocumentDialog"
      :provider-id="createdProvider?.id || null"
      :provider-name="createdProvider?.nama_penyedia || ''"
      @close="handleDocumentDialogClose"
      @uploaded="handleDocumentUploaded"
    />
  </div>
</template>

<style scoped>
/* Using Vuetify components for styling */
</style>
