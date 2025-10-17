<script setup lang="ts">
import KontrakForm from '@/components/forms/Kontrak.vue'
import { useGqlMutation } from '@/composables/graphql/useGqlMutation'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const paketPengadaanId = ref(route.query.paketPengadaanId ? Number(decryptId(route.query.paketPengadaanId)) : null)

const { execute: createKontrak, data: createKontrakData } = useGqlMutation('kontrak', 'create')

const isSubmitting = ref(false)

const handleSubmit = async (formData: any) => {
  console.log('formData', formData)

  if (isSubmitting.value)
    return

  isSubmitting.value = true

  try {
    // Create the contract
    await createKontrak({
      data: formData,
    })

    const result = createKontrakData.value

    if (result?.id) {
      showSnackbar('Kontrak berhasil ditambahkan', 'success')
      navigateTo('/kontrak')
    }
    else {
      showSnackbar('Gagal menambahkan kontrak', 'error')
    }
  }
  catch (error) {
    console.error('Error creating contract:', error)
    showSnackbar(`Gagal menambahkan kontrak: ${error}`, 'error')
  }
  finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  navigateTo('/kontrak')
}
</script>

<template>
  <div>
    <KontrakForm mode="create" @submit="handleSubmit" :paketPengadaanId="paketPengadaanId" @cancel="handleCancel" />
  </div>
</template>

<style scoped>
/* Using Vuetify components for styling */
</style>
