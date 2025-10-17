<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGqlMutation } from '@/composables/graphql/useGqlMutation'
import { useGqlQuery } from '@/composables/graphql/useGqlQuery'
import { showSnackbar } from '@/composables/useSnackbar'

// State
const roles = ref<any[]>([])
const total = ref(0)
const isLoading = ref(false)
const page = ref(1)
const itemsPerPage = ref(10)
const search = ref('')

// Dialog & form
const dialog = ref(false)
const isEdit = ref(false)
const form = ref({ id: null, name: '', code: '', is_scoped: false, scope_model: '' })
const errors = ref<{ name?: string; code?: string; scope_model?: string }>({})

const scopeModelOptions = [
  { label: 'Unit', value: 'unit' },
  { label: 'Sub-Unit', value: 'sub-unit' },
  { label: 'Sub-Sub-Unit', value: 'sub-sub-unit' },
]

// Fetch roles
const fetchRoles = async () => {
  isLoading.value = true

  const skip = (page.value - 1) * itemsPerPage.value
  const take = itemsPerPage.value

  const { data, total, error, refetch } = useGqlQuery('role', 'get', {
    sortBy: 'id',
    search: search.value,
    skip,
    take,
  }, { cachePolicy: 'no-cache', firstExecution: true })

  await refetch()
  console.log('fetchRoles', data.value, error.value)
  if (error.value)
    showSnackbar('Gagal memuat data role', 'error')
  roles.value = data.value || []
  total.value = total.value || 0
  isLoading.value = false
}

onMounted(fetchRoles)

const handleSearch = () => {
  page.value = 1
  fetchRoles()
}

const openDialog = (role: any = null) => {
  // Jika role adalah event (dari @click tanpa argumen), tetap mode tambah
  if (role && typeof role === 'object' && 'id' in role) {
    isEdit.value = true
    form.value = { ...role }
  }
  else {
    isEdit.value = false
    form.value = { id: null, name: '', code: '', is_scoped: false, scope_model: '' }
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
}

// Validate form
const validateForm = () => {
  errors.value = {}
  let valid = true
  if (!form.value.name) {
    errors.value.name = 'Nama wajib diisi'
    valid = false
  }
  if (!form.value.code) {
    errors.value.code = 'Kode wajib diisi'
    valid = false
  }
  if (form.value.is_scoped && !form.value.scope_model) {
    errors.value.scope_model = 'Scope Model wajib diisi jika scoped'
    valid = false
  }

  return valid
}

// Create or update
const saveRole = async () => {
  if (!validateForm())
    return

  const mode = isEdit.value ? 'update' : 'create'

  console.log('saveRole', mode, form.value)

  const variables = isEdit.value
    ? { id: Number.parseInt(form.value.id), data: { name: form.value.name, code: form.value.code, is_scoped: form.value.is_scoped, scope_model: form.value.scope_model } }
    : { data: { name: form.value.name, code: form.value.code, is_scoped: form.value.is_scoped, scope_model: form.value.scope_model } }

  const { data, error, execute } = useGqlMutation('role', mode)

  await execute(variables)
  if (error.value)
    return showSnackbar('Gagal menyimpan role', 'error')
  showSnackbar('Role berhasil disimpan', 'success')
  closeDialog()
  fetchRoles()
}

// Delete
const deleteRole = async (id: number) => {
  if (!confirm('Yakin hapus role ini?'))
    return
  const { error, execute } = useGqlMutation('role', 'delete')

  await execute({ id: Number.parseInt(id) })
  if (error.value)
    return showSnackbar('Gagal menghapus role', 'error')
  showSnackbar('Role berhasil dihapus', 'success')
  fetchRoles()
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex justify-space-between align-center">
      <span class="text-h5">Manajemen Role</span>
      <VBtn
        color="primary"
        @click="openDialog"
      >
        <VIcon>bx-plus</VIcon>
        Tambah Role
      </VBtn>
    </VCardTitle>
    <VCardText>
      <VRow class="mb-4">
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="search"
            label="Cari Role"
            append-inner-icon="mdi-magnify"
            @keyup.enter="handleSearch"
            @click:append-inner="handleSearch"
          />
        </VCol>
      </VRow>
      <VDataTable
        v-model:page="page"
        :items="roles"
        :loading="isLoading"
        :items-per-page="itemsPerPage"
        :server-items-length="total"
        class="elevation-1"
        :headers="[
          { title: 'Nama', key: 'name' },
          { title: 'Kode', key: 'code' },
          { title: 'Scoped', key: 'is_scoped' },
          { title: 'Scope Model', key: 'scope_model' },
          { title: 'Aksi', key: 'actions', sortable: false, width: 120 },
        ]"
        @update:page="fetchRoles"
      >
        <template #item.is_scoped="{ item }">
          <VChip
            :color="item.is_scoped ? 'success' : 'grey'"
            small
          >
            {{ item.is_scoped ? 'Ya' : 'Tidak' }}
          </VChip>
        </template>
        <template #item.actions="{ item }">
          <VBtn
            icon
            variant="text"
            size="small"
            color="primary"
            @click="openDialog(item)"
          >
            <VIcon>bx-edit</VIcon>
          </VBtn>
          <VBtn
            icon
            variant="text"
            size="small"
            color="error"
            @click="deleteRole(item.id)"
          >
            <VIcon>bx-trash</VIcon>
          </VBtn>
        </template>
      </VDataTable>
      <TablePagination
        :page="page"
        :items-per-page="itemsPerPage"
        :total-items="total"
        @update:page="val => { page = val; fetchRoles() }"
      />
    </VCardText>
  </VCard>

  <!-- Dialog Form -->
  <VDialog
    v-model="dialog"
    max-width="500"
  >
    <VCard>
      <VCardTitle>{{ isEdit ? 'Edit Role' : 'Tambah Role' }}</VCardTitle>
      <VCardText>
        <VForm @submit.prevent="saveRole">
          <VTextField
            v-model="form.name"
            label="Nama"
            :error-messages="errors.name"
            required
          />
          <VTextField
            v-model="form.code"
            label="Kode"
            :error-messages="errors.code"
            required
          />
          <VSwitch
            v-model="form.is_scoped"
            label="Scoped?"
          />
          <VSelect
            v-if="form.is_scoped"
            v-model="form.scope_model"
            :items="scopeModelOptions"
            item-title="label"
            item-value="value"
            label="Scope Model"
            :error-messages="errors.scope_model"
            required
          />
        </VForm>
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          text
          @click="closeDialog"
        >
          Batal
        </VBtn>
        <VBtn
          color="primary"
          @click="saveRole"
        >
          Simpan
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
