<script setup lang="ts">
import { ref } from 'vue'
import PenyediaForm from '@/components/forms/Penyedia.vue'
import { useGqlMutation } from '@/composables/graphql/useGqlMutation'
import { useFileUpload } from '@/composables/useFileUpload'

const route = useRoute()
const providerId = ref((route.params as any).id ? Number(decryptId((route.params as any).id)) : null)

const npwpRekananId = DOKUMEN_NPWP_REKANAN_ID
const referensiBankId = DOKUMEN_REFERENSI_BANK_ID

const { execute: updatePenyedia, data: updateResult } = useGqlMutation('penyedia', 'update')
const { uploadMultipleFiles } = useFileUpload()

const isSubmitting = ref(false)

const handleSubmit = async (submitData: any) => {
  if (!providerId.value) {
    showSnackbar('ID penyedia tidak ditemukan', 'error')

    return
  }

  if (isSubmitting.value)
    return

  isSubmitting.value = true

  try {
    // Extract provider data and files
    const { providerData, files } = submitData

    // Update the provider first
    await updatePenyedia({
      data: providerData,
      updatePenyediaId: providerId.value,
    })

    console.log('Provider update result:', updateResult.value)

    // Upload files if any
    const filesToUpload = []

    if (files?.npwp_rekanan && files.npwp_rekanan instanceof File) {
      filesToUpload.push({
        file: files.npwp_rekanan,
        type: npwpRekananId,
        name: 'NPWP Rekanan',
      })
    }

    if (files?.referensi_bank && files.referensi_bank instanceof File) {
      filesToUpload.push({
        file: files.referensi_bank,
        type: referensiBankId,
        name: 'Referensi Bank Rekanan',
      })
    }

    // Debug log to verify mapping
    // console.log('filesToUpload', filesToUpload.map(f => ({
    //   label: f.label,
    //   name: f.file.name,
    //   type: f.type,
    // })))

    if (filesToUpload.length > 0) {
      // Pastikan uploadMultipleFiles menerima mapping yang benar
      const uploadResults = await uploadMultipleFiles(filesToUpload, 'penyediaId', providerId.value)
      if (uploadResults.length > 0)
        showSnackbar(`Penyedia berhasil diperbarui dengan ${uploadResults.length} dokumen`, 'success')

      else
        showSnackbar('Penyedia berhasil diperbarui tetapi gagal mengupload dokumen', 'warning')
    }
    else {
      showSnackbar('Penyedia berhasil diperbarui', 'success')
    }

    // Navigate back to list page
    navigateTo('/pengaturan/penyedia')
  }

  // catch (error) {
  //   console.error('Error updating provider:', error)
  //   showSnackbar(`Gagal memperbarui penyedia: ${error}`, 'error')
  // }
  finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  navigateTo('/pengaturan/penyedia')
}

// Redirect to list if no ID provided
if (!providerId.value)
  navigateTo('/pengaturan/penyedia')
</script>

<template>
  <PenyediaForm
    mode="edit"
    :provider-id="providerId"
    @submit="handleSubmit"
    @cancel="handleCancel"
  />
</template>

<style scoped>
/* Using Vuetify components for styling */
</style>
