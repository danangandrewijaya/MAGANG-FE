<script setup lang="ts">
import KontrakForm from '@/components/forms/Kontrak.vue'
import { useGqlMutation } from '@/composables/graphql/useGqlMutation'
import { ref } from 'vue'

const route = useRoute()
const contractId = ref((route.params as any).id ? Number(decryptId((route.params as any).id)) : null)

console.log('contractId', contractId.value)

const { execute: updateKontrak, data: updateResult } = useGqlMutation('kontrak', 'update')

const isSubmitting = ref(false)

const handleSubmit = async (formData: any) => {
  console.log('formData', formData)

  if (!contractId.value) {
    showSnackbar('ID kontrak tidak ditemukan', 'error')
    return
  }

  if (isSubmitting.value)
    return

  isSubmitting.value = true

  try {
    await updateKontrak({
      data: formData,
      updateKontrakId: contractId.value,
    })

    if (updateResult.value?.id) {
      showSnackbar('Kontrak berhasil diperbarui', 'success')
      navigateTo('/kontrak')
    }
    else {
      showSnackbar('Gagal memperbarui kontrak', 'error')
    }
  }
  catch (error) {
    console.error('Error updating contract:', error)
    showSnackbar(`Gagal memperbarui kontrak: ${error}`, 'error')
  }
  finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  navigateTo('/kontrak')
}

// Redirect to list if no ID provided
if (!contractId.value)
  navigateTo('/kontrak')
</script>

<template>
  <KontrakForm mode="edit" :contract-id="contractId" @submit="handleSubmit" @cancel="handleCancel" />
</template>

<style scoped>
/* Using Vuetify components for styling */
</style>
