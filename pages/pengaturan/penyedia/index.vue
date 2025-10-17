<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGqlMutation } from '@/composables/graphql/useGqlMutation'
import { useGqlQuery } from '@/composables/graphql/useGqlQuery'

// Updated column mapping to match actual API response fields
const columns = ref([
  { title: 'Nama Penyedia', key: 'nama_penyedia' },
  { title: 'Email', key: 'email' },
  { title: 'Telepon', key: 'no_telepon' },
  { title: 'NPWP', key: 'npwp' },
  { title: 'DRM Tumbas', key: 'is_tumbas' },

  // { title: 'Status', key: 'is_active', format: (value: boolean) => value ? 'Aktif' : 'Nonaktif' },
  { title: 'Aksi', key: 'actions', sortable: false },
])

const { data, total, refetch } = useGqlQuery('penyedia', 'get', { page: 1, limit: 10 })
const { execute: deletePenyedia } = useGqlMutation('penyedia', 'delete')

const serverItems = ref([])
const totalItems = ref(0)
const loading = ref(false)
const showDocumentDialog = ref(false)
const selectedProvider = ref<{ id: number; nama_penyedia: string } | null>(null)
const isSyncingPenyedia = ref(false)

const options = ref({
  page: 1,
  itemsPerPage: 10,
})

const search = ref('')
const selectedJenisPenyedia = ref(null)

const jenisPenyediaOptions = [
  { title: 'DRM dari Tumbas', value: true },
  { title: 'DRM bukan dari Tumbas', value: false },
]

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const fetchData = async () => {
  loading.value = true

  const variables = {
    page: options.value.page,
    limit: options.value.itemsPerPage === -1 ? 1000 : options.value.itemsPerPage,
    filter: {
      nama_penyedia: search.value || undefined,
      is_tumbas: selectedJenisPenyedia.value !== null ? selectedJenisPenyedia.value : undefined,
    },
  }

  await refetch(variables)

  serverItems.value = data.value || []
  totalItems.value = total.value || 0

  loading.value = false
}

// Watch for options, search, or isTumbas changes to update data
watch([options, search, selectedJenisPenyedia], async ([newOptions, newSearch, newIsTumbas], [oldOptions, oldSearch, oldIsTumbas]) => {
  if (newSearch !== oldSearch) {
    if (searchTimeout)
      clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      fetchData()
    }, 500) // 500ms debounce
  }
  else if (newIsTumbas !== oldIsTumbas) {
    await fetchData()
  }
  else {
    await fetchData()
  }
}, { deep: true })

// Initial data fetch
fetchData()

// Reset page to 1 if itemsPerPage changes
watch(
  () => options.value.itemsPerPage,
  (newVal, oldVal) => {
    if (newVal !== oldVal)
      options.value.page = 1
  },
)

const handleAdd = () => {
  console.log('Navigating to add page')

  // Add navigation logic here
  navigateTo('/pengaturan/penyedia/add')
}

// const handleBack = () => {
//   console.log('Navigating back')

//   // Add navigation logic here
// }

const handleEdit = (id: number) => {
  // console.log('Navigating to edit page for ID:', id)
  navigateTo(`/pengaturan/penyedia/edit/${encryptId(id)}`)
}

const handleDelete = async (id: number) => {
  try {
    await deletePenyedia({ deletePenyediaId: Number.parseInt(id) })
    console.log('Penyedia deleted successfully')

    // Refresh the data after deletion
    await fetchData()
  }
  catch (error) {
    console.error('Error deleting penyedia:', error)
  }
}

function handleDeleteConfirmDialog(id: number) {
  openDialog(
    'Hapus data?',
    'Apakah Anda yakin ingin menghapus data ini?',
    () => {
      handleDelete(id)
    },
  )
}

const { execute: syncPenyedia } = useGqlMutation('penyedia_drm', 'update', {
  customSuccessMessage: 'DRM berhasil disinkronisasi',
})

const handleSyncPenyedia = async () => {
  isSyncingPenyedia.value = true
  try {
    await syncPenyedia()

    // Optionally show snackbar or reload data
  }
  catch (e) {
    // Optionally show error
  }
  isSyncingPenyedia.value = false
}

const handleManageDocuments = (provider: any) => {
  selectedProvider.value = {
    id: provider.id,
    nama_penyedia: provider.nama_penyedia,
  }
  showDocumentDialog.value = true
}

const handleDocumentUploaded = (count: number) => {
  console.log(`${count} documents uploaded successfully`)

  // Could refresh data here if needed
}

const handleDocumentDialogClose = () => {
  showDocumentDialog.value = false
  selectedProvider.value = null
}
</script>

<template>
  <VCard
    title="Daftar Penyedia"
    class="mb-6"
  >
    <!-- 👉 Filter -->
    <VCardText class="pb-5">
      <VRow>
        <!-- 👉 Select Jenis Penyedia -->
        <VCol
          cols="12"
          sm="4"
        >
          <AppSelect
            v-model="selectedJenisPenyedia"
            placeholder="Jenis Penyedia"
            :items="jenisPenyediaOptions"
            clearable
            clear-icon="bx-x"
          />
        </VCol>

        <!-- 👉 Select Filter 2 -->
        <!--
          <VCol
          cols="12"
          sm="4"
          >
          <AppSelect
          v-model="selectedCategory"
          placeholder="Category"
          :items="categories"
          clearable
          clear-icon="bx-x"
          />
          </VCol>
        -->

        <!-- 👉 Select Filter 3 -->
        <!--
          <VCol
          cols="12"
          sm="4"
          >
          <AppSelect
          v-model="selectedStock"
          placeholder="Stock"
          :items="stockStatus"
          clearable
          clear-icon="bx-x"
          />
          </VCol>
        -->
      </VRow>
    </VCardText>

    <VDivider />

    <div class="d-flex flex-wrap gap-4 pa-6">
      <div class="d-flex align-center">
        <!-- 👉 Search  -->
        <AppTextField
          v-model="search"
          placeholder="Search"
          style="inline-size: 250px;"
          class="me-3"
        />
      </div>

      <VSpacer />
      <div class="d-flex gap-4 flex-wrap align-center">
        <AppSelect
          v-model="options.itemsPerPage"
          :items="ITEM_PER_PAGE_OPTIONS"
        />
        <!-- 👉 Add button -->
        <VBtn
          color="primary"
          prepend-icon="bx-plus"
          @click="handleAdd"
        >
          Tambah
        </VBtn>
        <!-- 👉 Sync button -->
        <VBtn
          color="info"
          :loading="isSyncingPenyedia"
          prepend-icon="bx-sync"
          @click="handleSyncPenyedia"
        >
          Sinkron DRM
        </VBtn>
        <!-- 👉 Back button -->
        <!--
          <VBtn
          color="secondary"
          variant="tonal"
          prepend-icon="bx-left-arrow-alt"
          @click="handleBack"
          >
          Kembali
          </VBtn>
        -->
      </div>
    </div>

    <VDivider />

    <VDataTableServer
      v-model:options="options"
      :headers="columns"
      :items="serverItems"
      :items-length="totalItems"
      :loading="loading"
      class="text-no-wrap"
    >
      <!--
        <template #item.is_active="{ item }">
        <VChip
        :color="item.is_active ? 'success' : 'error'"
        size="small"
        >
        {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
        </VChip>
        </template>
      -->

      <template #item.is_tumbas="{ item }">
        <VChip
          :color="item.is_tumbas ? 'success' : 'secondary'"
          size="small"
          variant="tonal"
        >
          {{ item.is_tumbas ? 'Ya' : 'Tidak' }}
        </VChip>
      </template>

      <template #item.actions="{ item }">
        <!-- Hide -->
        <!--
          <VBtn
          icon
          variant="text"
          size="small"
          color="info"
          @click="() => handleManageDocuments(item)"
          >
          <VIcon>bx-file</VIcon>
          </VBtn>
        -->
        <VBtn
          icon
          variant="text"
          size="small"
          color="primary"
          @click="() => handleEdit(item.id)"
        >
          <VIcon>bx-edit</VIcon>
        </VBtn>
        <VBtn
          icon
          variant="text"
          size="small"
          color="error"
          @click="() => handleDeleteConfirmDialog(item.id)"
        >
          <VIcon>bx-trash</VIcon>
        </VBtn>
      </template>

      <!-- pagination -->
      <template #bottom>
        <TablePagination
          v-model:page="options.page"
          :items-per-page="options.itemsPerPage"
          :total-items="totalItems"
        />
      </template>
    </VDataTableServer>

    <!-- Document Upload Dialog -->
    <DocumentPenyediaUpload
      :visible="showDocumentDialog"
      :provider-id="selectedProvider?.id || null"
      :provider-name="selectedProvider?.nama_penyedia || ''"
      @close="handleDocumentDialogClose"
      @uploaded="handleDocumentUploaded"
    />
  </VCard>
</template>
