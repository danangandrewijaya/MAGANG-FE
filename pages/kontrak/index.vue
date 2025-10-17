<script setup lang="ts">
import { useSessionStore } from '@/stores/session'
import { ref, watch } from 'vue'
import { ITEM_PER_PAGE_OPTIONS } from '~/utils/constants'

const subSubUnits = ref<number | null>(null)
const subUnits = ref<number | null>(null)
const units = ref<number | null>(null)
const scopedModel = ref<any>(null)
const role = ref<string | null>(null)

const fetchScopeUser = async () => {
  const user = useSessionStore().activeUser
  scopedModel.value = user.scopedModel
  subSubUnits.value = scopedModel.value?.subSubUnit?.id
  subUnits.value = scopedModel.value?.subUnit?.id
  units.value = scopedModel.value?.unit?.id
  role.value = user.role
}

onMounted(() => {
  fetchData()
})

// Watch subSubUnits, fetch data jika sudah ada id
watch(subSubUnits, (newVal) => {
  if (newVal) {
    fetchData()
  }
})

const columns = ref([
  { title: 'Nama Paket', key: 'paketPengadaan.nama_paket' },
  { title: 'Nomor Kontrak', key: 'nomor_kontrak' },
  { title: 'Tanggal', key: 'tanggal_kontrak' },
  { title: 'Nilai Kontrak', key: 'nilai_kontrak' },
  { title: 'Metode Pemilihan', key: 'paketPengadaan.metode_pemilihan' },
  { title: 'Status Dokumen', key: 'status' },
  { title: 'Aksi', key: 'actions', sortable: false }
]);

const { data, total, refetch } = useGqlQuery('kontrak', 'get', { page: 1, limit: 10 })
const { execute: deleteKontrak } = useGqlMutation('kontrak', 'delete')

const serverItems = ref([])
const totalItems = ref(0)
const loading = ref(false)
const options = ref({
  page: 1,
  itemsPerPage: 10,
})

const searchNomorKontrak = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDateIndonesian = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchData = async () => {
  loading.value = true

  fetchScopeUser()
  // Determine which filter to use based on user role
  let filterConfig = {}

  const roleValue = role.value

  if (roleValue === 'operator_sub_subunit') {
    filterConfig = {
      subsubunitId: Number(subSubUnits.value) || null
    }
  } else if (roleValue === 'operator_subunit') {
    filterConfig = {
      subunitId: Number(subUnits.value) || null
    }
  } else if (roleValue === 'operator_unit') {
    filterConfig = {
      unitId: Number(units.value)
    }
  }

  const variables = {
    page: options.value.page,
    limit: options.value.itemsPerPage === -1 ? 1000 : options.value.itemsPerPage,
    filter: {
      nomor_kontrak: searchNomorKontrak.value || undefined,
      ...filterConfig,
    },
  }

  await refetch(variables)

  serverItems.value = data.value || []
  totalItems.value = total.value || 0
  loading.value = false
}

// Watch for options dan searchNomorKontrak (dengan debounce)
watch([options, searchNomorKontrak], async ([newOptions, newNomor], [oldOptions, oldNomor]) => {
  if (newNomor !== oldNomor) {
    if (searchTimeout)
      clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      fetchData()
    }, 500) // 500ms debounce
  } else {
    await fetchData()
  }
}, { deep: true })

// Reset page to 1 if itemsPerPage changes
watch(
  () => options.value.itemsPerPage,
  (newVal, oldVal) => {
    if (newVal !== oldVal)
      options.value.page = 1
  },
)

// Initial data fetch
// fetchData()


const handleAdd = () => {
  console.log('Navigating to add page')

  // Add navigation logic here
  // navigateTo('/kontrak/add')
  navigateTo('/paket-pengadaan')
}

const handleDetail = (id: number) => {
  console.log('Navigating to detail page for ID:', id)
  navigateTo(`/kontrak/${encryptId(id)}`)
}

const handleEdit = (id: number) => {
  console.log('Navigating to edit page for ID:', id)
  navigateTo(`/kontrak/edit/${encryptId(id)}`)
}

const handleDelete = async (id: number) => {
  try {
    await deleteKontrak({ deleteKontrakId: Number(id) })
    console.log('Kontrak deleted successfully')

    // Refresh the data after deletion
    await fetchData()
  }
  catch (error) {
    console.error('Error deleting kontrak:', error)
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
</script>

<template>
  <VCard title="Daftar Kontrak" class="mb-6">
    <VDivider />

    <div class="d-flex flex-wrap gap-4 pa-6">
      <div class="d-flex align-center">
        <!-- 👉 Search  -->
        <AppTextField v-model="searchNomorKontrak" placeholder="Cari Nomor Kontrak" style="inline-size: 250px;"
          class="me-3" />
      </div>

      <VSpacer />
      <div class="d-flex gap-4 flex-wrap align-center">
        <!-- 👉 Items per page selector -->
        <AppSelect v-model="options.itemsPerPage" :items="ITEM_PER_PAGE_OPTIONS" />
        <!-- 👉 Add button -->
        <VBtn color="primary" prepend-icon="bx-plus" @click="handleAdd">
          Tambah
        </VBtn>
      </div>
    </div>

    <VDivider />

    <VDataTableServer v-model:options="options" :headers="columns" :items="serverItems" :items-length="totalItems"
      :loading="loading" class="text-no-wrap">
      <template #item.paketPengadaan.nama_paket="{ item }">
        {{ item.paketPengadaan?.nama_paket || 'Tidak Ada Nama Paket' }}
      </template>
      <template #item.nilai_kontrak="{ item }">
        {{ formatCurrency(item.nilai_kontrak) }}
      </template>
      <template #item.tanggal_kontrak="{ item }">
        {{ formatDateIndonesian(item.tanggal_kontrak) }}
      </template>
      <template #item.paketPengadaan.metode_pemilihan="{ item }">
        {{ item.paketPengadaan?.metode_pemilihan || 'Tidak Ada Metode Pemilihan' }}
      </template>
      <template #item.status="{ item }">
        <VChip color="success" size="small">
          Aktif
        </VChip>
      </template>
      <template #item.actions="{ item }">
        <VBtn icon variant="text" size="small" color="info" @click="() => handleDetail(item.id)">
          <VIcon>bx-show</VIcon>
        </VBtn>
        <VBtn icon variant="text" size="small" color="primary" @click="() => handleEdit(item.id)">
          <VIcon>bx-edit</VIcon>
        </VBtn>
        <VBtn icon variant="text" size="small" color="error" @click="() => handleDeleteConfirmDialog(item.id)">
          <VIcon>bx-trash</VIcon>
        </VBtn>
      </template>

      <!-- pagination -->
      <template #bottom>
        <TablePagination v-model:page="options.page" :items-per-page="options.itemsPerPage" :total-items="totalItems" />
      </template>
    </VDataTableServer>
  </VCard>

</template>
