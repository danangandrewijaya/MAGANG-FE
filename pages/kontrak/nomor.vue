<script setup lang="ts">
const { generate, error, loading, data } = useGenerateNomorDokumen()
const jenisNomorId = 1 // Ganti dengan ID jenis nomor yang sesuai
const unitId = 1 // Ganti dengan ID unit yang sesuai
const tanggal = new Date().toISOString().split('T')[0] // Format tanggal YYYY-MM-DD

const handleGenerateNomor = async () => {
  try {
    await generate({ jenisNomorId, unitId, tanggal })

    // data.value sudah terupdate otomatis
    console.log('Generated Nomor:', data.value)
  }
  catch (e) {
    // error.value sudah terupdate otomatis
    console.error('Error generating nomor:', error.value)
  }
}

handleGenerateNomor()
</script>

<template>
  <div>
    <div v-if="loading">
      Loading...
    </div>
    <div
      v-else-if="error"
      style="color: red;"
    >
      {{ error.message || error }}
    </div>
    <div v-else-if="data">
      Generated Nomor: {{ data }}
    </div>
  </div>
</template>
