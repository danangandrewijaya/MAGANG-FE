<script setup lang="ts">
import { useApolloClient } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { jwtDecode } from 'jwt-decode'
import { computed, ref, watch } from 'vue'

const apollo = useApolloClient()

// Table configuration
const search = ref('')
const dialog = ref(false)
const dialogDelete = ref(false)
const loading = ref(false)
const sortBy = ref([])
const descending = ref(false)
const page = ref(1)
const limit = ref(10)

const headers = [
  { title: 'SSO Identity', key: 'sso_identity', sortable: true },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Roles', key: 'userRole', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Form data
const models = ref([])
const selectedRole = ref(null)
const selectedModel = ref(null)
const tempUnit = ref(null)
const tempSubUnit = ref(null)

const defaultItem = ref({
  id: null,
  sso_identity: null,
  name: '',
  email: '',
  userRoles: [], // Array of role-model pairs
  unit_id: null,
  subunit_id: null,
  subsubunit_id: null,
})

const editedIndex = ref(-1)
const editedItem = ref({ ...defaultItem.value })
const users = ref([])
const roles = ref([])
const units = ref([])
const subUnits = ref([])
const subSubUnits = ref([])
const pegawaiList = ref([])
const pegawaiLoading = ref(false)
const totalUsers = ref(0)
const searchQuery = ref('')

const snackbar = ref({
  show: false,
  message: '',
  color: '',
})

// Computed properties
const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New User' : 'Edit User'
})

const currentScopeModel = computed(() => {
  const role = roles.value.find(r => r.id === selectedRole.value)

  return role?.scope_model
})

const canAddRole = computed(() => {
  if (!selectedRole.value)
    return false

  switch (currentScopeModel.value) {
    case 'unit':
      return !!selectedModel.value
    case 'sub-unit':
      return !!selectedModel.value && !!tempUnit.value
    case 'sub-sub-unit':
      return !!selectedModel.value && !!tempUnit.value && !!tempSubUnit.value
    default:
      return true
  }
})

// Fetch functions
const initialize = async () => {
  loading.value = true
  try {
    const { data } = await apollo.client.query({
      query: gql`
        query Query(
          $page: Int
          $limit: Int
          $search: String
          $sortBy: String
          $descending: Boolean
        ) {
          userGetList(
            page: $page
            limit: $limit
            search: $search
            sortBy: $sortBy
            descending: $descending
          ) {
            data {
              id
              email
              name
              sso_identity
              userRole {
                id
                model_id
                role {
                  id
                  name
                  scope_model
                }
                scopedModel {
                  unit {
                    id
                    nama_unit
                  }
                  subUnit {
                    id
                    nama_subunit
                  }
                  subSubUnit {
                    id
                    nama_subsubunit
                  }
                }
              }
            }
            total
          }
        }
      `,
      variables: {
        page: page.value,
        limit: limit.value,
        search: search.value || undefined,
        sortBy: sortBy.value?.[0]?.key || undefined,
        descending: descending.value,
      },
      fetchPolicy: 'network-only',
    })

    users.value = data.userGetList.data
    totalUsers.value = data.userGetList.total
  }
  catch (error) {
    console.error('Error fetching users:', error)
    showSnackbar('Error fetching users', 'error')
  }
  finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const { data } = await apollo.client.query({
      query: gql`
        query GetRoles {
          getListRole(take: 100) {
            data {
              id
              name
              scope_model
            }
          }
        }
      `,
    })

    console.log('Roles:', data.getListRole.data) // Debug log
    roles.value = data.getListRole.data
  }
  catch (error) {
    console.error('Error fetching roles:', error)
  }
}

const fetchUnits = async () => {
  try {
    const { data } = await apollo.client.query({
      query: gql`
        query GetUnits {
          getListUnit(take: 100) {
            data {
              id
              nama_unit
            }
          }
        }
      `,
    })

    units.value = data.getListUnit.data
  }
  catch (error) {
    console.error('Error fetching units:', error)
  }
}

const fetchSubUnits = async () => {
  if (!tempUnit.value)
    return
  try {
    const { data } = await apollo.client.query({
      query: gql`
        query GetSubUnits($unitId: Int!) {
          getListSubUnit(id_unit: $unitId, limit: 100) {
            data {
              id
              nama_subunit
            }
          }
        }
      `,
      variables: {
        unitId: Number.parseInt(tempUnit.value),
      },
    })

    subUnits.value = data.getListSubUnit.data
    tempSubUnit.value = null
  }
  catch (error) {
    console.error('Error fetching sub units:', error)
  }
}

const fetchSubSubUnits = async () => {
  if (!tempSubUnit.value)
    return
  try {
    const { data } = await apollo.client.query({
      query: gql`
        query GetSubSubUnits($subUnitId: Int!) {
          getListSubSubUnit(id_subunit: $subUnitId, limit: 100) {
            data {
              id
              nama_subsubunit
            }
          }
        }
      `,
      variables: {
        subUnitId: Number.parseInt(tempSubUnit.value),
      },
    })

    subSubUnits.value = data.getListSubSubUnit.data
  }
  catch (error) {
    console.error('Error fetching sub sub units:', error)
  }
}

const searchPegawai = async search => {
  console.log('Searching for:', search)
  if (!search || search.length < 3) {
    pegawaiList.value = []

    return
  }

  pegawaiLoading.value = true
  try {
    const { data } = await apollo.client.query({
      query: gql`
        query GetListPegawai($search: String!) {
          getListPegawai(search: $search) {
            nip
            nama
            gelar_depan
            gelar_belakang
            unit_name
          }
        }
      `,
      variables: { search },
      fetchPolicy: 'network-only',
    })

    console.log('Search results:', data)

    pegawaiList.value = data.getListPegawai.map(item => ({
      sso_identity: item.nip,
      name: `${item.gelar_depan || ''} ${item.nama} ${item.gelar_belakang || ''
      }`,
      unit_name: item.unit_name || '-',
    }))
  }
  catch (error) {
    console.error('Error searching pegawai:', error)
    pegawaiList.value = []
  }
  finally {
    pegawaiLoading.value = false
  }
}

const handlePegawaiSelect = value => {
  if (value && typeof value === 'object') {
    editedItem.value = {
      ...editedItem.value,
      sso_identity: value.sso_identity,
      name: value.name,
      email: `${value.sso_identity}@undip.ac.id`,
    }
  }
  else {
    editedItem.value = {
      ...editedItem.value,
      sso_identity: '',
      name: '',
      email: '',
    }
  }
}

const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout

  return function (...args: any[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

watch(
  searchQuery,
  debounce(async newVal => {
    if (newVal)
      await searchPegawai(newVal)
    else
      pegawaiList.value = []
  }, 300), // 300ms debounce
)

const handleRoleChange = async roleId => {
  console.log('Selected role ID:', roleId)
  selectedModel.value = null
  tempUnit.value = null
  tempSubUnit.value = null
  if (!roleId)
    return

  const role = roles.value.find(r => r.id === roleId)

  console.log('Found role:', role)

  // Reset all selections
  selectedModel.value = null
  tempUnit.value = null
  tempSubUnit.value = null
  subUnits.value = []
  subSubUnits.value = []

  if (role?.scope_model === 'unit') {
    // For unit scope, we already have the units loaded

  }
}

const addUserRole = () => {
  const role = roles.value.find(r => r.id === selectedRole.value)
  if (!role)
    return

  let modelName = ''
  if (role.scope_model === 'unit') {
    const unit = units.value.find(u => u.id === selectedModel.value)

    modelName = unit?.nama_unit || ''
  }
  else if (role.scope_model === 'sub-unit') {
    const subUnit = subUnits.value.find(u => u.id === selectedModel.value)

    modelName = subUnit?.nama_subunit || ''
  }
  else if (role.scope_model === 'sub-sub-unit') {
    const subSubUnit = subSubUnits.value.find(
      u => u.id === selectedModel.value,
    )

    modelName = subSubUnit?.nama_subsubunit || ''
  }

  const newUserRole = {
    role_id: role.id,
    role_name: role.name,
    model_id: selectedModel.value,
    model_name: modelName,
  }

  // Check if role-model pair already exists
  const exists = editedItem.value.userRoles.some(
    ur =>
      ur.role_id === newUserRole.role_id && ur.model_id === newUserRole.model_id,
  )

  if (!exists)
    editedItem.value.userRoles.push(newUserRole)

  // Reset selections
  selectedRole.value = null
  selectedModel.value = null
  tempUnit.value = null
  tempSubUnit.value = null
}

const removeUserRole = index => {
  editedItem.value.userRoles.splice(index, 1)
}

// Event handlers
const editItem = item => {
  editedIndex.value = users.value.indexOf(item)
  editedItem.value = {
    ...item,
    userRoles:
      item.userRole?.map(ur => ({
        role_id: ur.role.id,
        role_name: ur.role.name,
        model_id: ur.model_id,
        model_name:
          ur.scopedModel?.unit?.nama_unit
          || ur.scopedModel?.subUnit?.nama_subunit
          || ur.scopedModel?.subSubUnit?.nama_subsubunit,
      })) || [],
  }
  dialog.value = true
}

const deleteItemConfirm = item => {
  editedIndex.value = users.value.indexOf(item)
  editedItem.value = { ...item }
  dialogDelete.value = true
}

const close = () => {
  dialog.value = false
  editedIndex.value = -1
  editedItem.value = { ...defaultItem.value }
  searchQuery.value = ''
}

const closeDelete = () => {
  dialogDelete.value = false
  editedIndex.value = -1
  editedItem.value = { ...defaultItem.value }
}

const save = async () => {
  if (!editedItem.value.userRoles.length) {
    showSnackbar('At least one role is required', 'error')

    return
  }

  try {
    const data = {
      sso_identity: editedItem.value.sso_identity,
      name: editedItem.value.name,
      email: editedItem.value.email,
      assignRoles: editedItem.value.userRoles.map(ur => ({
        roleId: Number.parseFloat(ur.role_id),
        modelId: ur.model_id?.toString(),
      })),
    }

    if (editedIndex.value > -1) {
      const response = await apollo.client.mutate({
        mutation: gql`
          mutation UpdateUser($id: String!, $data: UpdateUserInput!) {
            updateUser(id: $id, data: $data) {
              id
            }
          }
        `,
        variables: {
          id: editedItem.value.id,
          data,
        },
      })

      if (response.data?.updateUser) {
        showSnackbar('User updated successfully')
        close()
        initialize()
      }
      else {
        throw new Error('Failed to update user')
      }
    }
    else {
      // For new user, we need password fields
      data.password = 'password123' // You might want to generate this or get from a form
      data.password_confirm = data.password

      const response = await apollo.client.mutate({
        mutation: gql`
          mutation CreateUser($data: CreateUserInput!) {
            createUser(data: $data) {
              id
            }
          }
        `,
        variables: { data },
      })

      if (response.data?.createUser) {
        showSnackbar('User created successfully')
        close()
        initialize()
      }
      else {
        throw new Error('Failed to create user')
      }
    }
  }
  catch (error) {
    console.error('Error saving:', error)
    if (error.graphQLErrors?.length > 0) {
      const errorMessage = error.graphQLErrors.map(e => e.message).join(', ')

      showSnackbar(errorMessage, 'error')
    }
    else if (error.networkError) {
      showSnackbar('Network error occurred', 'error')
    }
    else {
      showSnackbar(error.message || 'Error saving user', 'error')
    }
  }
}

const deleteItem = async item => {
  try {
    const { data } = await apollo.client.mutate({
      mutation: gql`
        mutation DeleteUser($id: String!) {
          deleteUser(id: $id)
        }
      `,
      variables: {
        id: item.id,
      },
    })

    if (data.deleteUser) {
      users.value = users.value.filter(user => user.id !== item.id)
      showSnackbar('User deleted successfully')
      closeDelete()
      initialize()
    }
    else {
      throw new Error('Failed to delete user')
    }
  }
  catch (error) {
    console.error('Error deleting user:', error)
    if (error.graphQLErrors?.length > 0) {
      const errorMessage = error.graphQLErrors.map(e => e.message).join(', ')

      showSnackbar(errorMessage, 'error')
    }
    else if (error.networkError) {
      showSnackbar('Network error occurred', 'error')
    }
    else {
      showSnackbar(error.message || 'Error deleting user', 'error')
    }
  }
}

// loginas

const loginAs = async user => {
  try {
    const { data } = await apollo.client.mutate({
      mutation: gql`
        mutation LoginAsUser($data: LoginAsUserInput!) {
          loginAsUser(data: $data) {
            token
          }
        }
      `,
      variables: {
        data: { targetUserId: user.id },
      },
    })

    const token = data?.loginAsUser?.token
    if (!token)
      throw new Error('Failed to get token from response')

    // Set token dan user session dari payload JWT
    useSessionStore().setToken(token)

    const payload = jwtDecode(token)

    useSessionStore().setActiveUser({
      id: payload.userId,
      userRoleId: payload.selectedRole?.model_id ?? null,
      role: payload.selectedRole?.code ?? 'custom',
      roleName: payload.selectedRole?.name ?? 'Unknown',
      scopedModel: payload.selectedRole?.scopeModel ?? null,
      selectedRole: payload.selectedRole ?? null,
      name: payload.user?.name ?? payload.name ?? '',
      email: payload.email,
      tahunAktif: Number(payload.setting?.tahun_aktif ?? 2025),
      menu: [],
    })

    // Navigasi dan reload
    navigateTo('/role')
    setTimeout(() => {
      window.location.reload()
    }, 100)

    showSnackbar('Login as user success')
  }
  catch (error) {
    console.error('Error login as user:', error)
    if (error.graphQLErrors?.length > 0) {
      const errorMessage = error.graphQLErrors.map(e => e.message).join(', ')

      showSnackbar(errorMessage, 'error')
    }
    else if (error.networkError) {
      showSnackbar('Network error occurred', 'error')
    }
    else {
      showSnackbar(error.message || 'Error login as user', 'error')
    }
  }
}

const updateSortBy = value => {
  sortBy.value = value
  initialize()
}

const updateSortDesc = value => {
  descending.value = value
  initialize()
}

// Initialize data
initialize()
fetchRoles()
fetchUnits()
</script>

<template>
  <div>
    <VCard>
      <VCardText>
        <VRow>
          <VCol cols="12">
            <div class="d-flex align-center flex-wrap gap-4">
              <div class="d-flex align-center gap-4">
                <h4 class="text-h4">
                  Pengaturan User
                </h4>
              </div>
              <VSpacer />
              <div class="d-flex align-center gap-4">
                <VTextField
                  v-model="search"
                  density="compact"
                  placeholder="Search"
                  append-inner-icon="bx-search"
                  single-line
                  hide-details
                  dense
                  outlined
                  @click:append-inner="initialize"
                />
                <VBtn
                  prepend-icon="bx-plus"
                  @click="editItem(defaultItem)"
                >
                  Add User
                </VBtn>
              </div>
            </div>
          </VCol>

          <VCol cols="12">
            <VDataTable
              v-model:items-per-page="limit"
              v-model:page="page"
              :headers="headers"
              :items="users"
              :loading="loading"
              :search="search"
              :sort-by="sortBy"
              :sort-desc="descending"
              class="elevation-1"
              @update:sort-by="updateSortBy"
              @update:sort-desc="updateSortDesc"
            >
              <template #item.actions="{ item }">
                <div class="d-flex gap-2 justify-end">
                  <VBtn
                    size="small"
                    color="primary"
                    prepend-icon="bx-edit"
                    @click="editItem(item)"
                  >
                    Edit
                  </VBtn>
                  <VBtn
                    size="small"
                    color="error"
                    prepend-icon="bx-trash"
                    @click="deleteItemConfirm(item)"
                  >
                    Delete
                  </VBtn>
                  <VBtn
                    size="small"
                    color="info"
                    prepend-icon="bx-key"
                    @click="loginAs(item)"
                  >
                    Login As
                  </VBtn>
                </div>
              </template>
              <template #item.userRole="{ item }">
                <div class="d-flex flex-wrap gap-2">
                  <VChip
                    v-for="(userRole, index) in item.userRole"
                    :key="index"
                    size="small"
                    color="primary"
                  >
                    {{ userRole.role.name }}
                    {{
                      userRole.scopedModel?.unit?.nama_unit
                        || userRole.scopedModel?.subUnit?.nama_subunit
                        || userRole.scopedModel?.subSubUnit?.nama_subsubunit
                        ? `- ${userRole.scopedModel?.unit?.nama_unit
                          || userRole.scopedModel?.subUnit?.nama_subunit
                          || userRole.scopedModel?.subSubUnit?.nama_subsubunit
                        }`
                        : ""
                    }}
                  </VChip>
                </div>
              </template>
            </VDataTable>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Add/Edit Dialog -->
    <VDialog
      v-model="dialog"
      persistent
      max-width="800px"
    >
      <VCard>
        <VCardTitle>
          <span class="text-h5">{{ formTitle }}</span>
        </VCardTitle>
        <VCardText>
          <VContainer>
            <VRow>
              <!-- SSO Identity (NIP) -->
              <VCol cols="12">
                <VAutocomplete
                  v-model="editedItem.sso_identity"
                  v-model:search="searchQuery"
                  :items="pegawaiList"
                  :loading="pegawaiLoading"
                  :item-title="(item) =>
                    `${item.sso_identity} - ${item.name} - ${item.unit_name}`
                  "
                  :item-value="(item) => item"
                  label="SSO Identity (NIP)"
                  dense
                  outlined
                  hide-selected
                  placeholder="Search by NIP or Name"
                  :menu-props="{ closeOnContentClick: true }"
                  @update:model-value="handlePegawaiSelect"
                >
                  <template #selection>
                    <span />
                  </template>
                </VAutocomplete>
              </VCol>

              <!-- Name -->
              <VCol cols="12">
                <VTextField
                  v-model="editedItem.name"
                  label="Name"
                  dense
                  outlined
                />
              </VCol>

              <!-- Email -->
              <VCol cols="12">
                <VTextField
                  v-model="editedItem.email"
                  label="Email"
                  dense
                  outlined
                  readonly
                />
              </VCol>

              <!-- Role Selection -->
              <VCol cols="12">
                <VRow>
                  <VCol cols="12">
                    <!-- Display selected role-model pairs -->
                    <div class="d-flex flex-wrap gap-2 mb-4">
                      <div
                        v-for="(userRole, index) in editedItem.userRoles"
                        :key="index"
                      >
                        <VChip
                          closable
                          @click:close="removeUserRole(index)"
                        >
                          {{ userRole.role_name }}
                          {{
                            userRole.model_name
                              ? `- ${userRole.model_name}`
                              : ""
                          }}
                        </VChip>
                      </div>
                    </div>

                    <!-- Selection Area -->
                    <VRow>
                      <!-- Role Selection -->
                      <VCol cols="3">
                        <VSelect
                          v-model="selectedRole"
                          :items="roles"
                          item-title="name"
                          item-value="id"
                          label="Role"
                          dense
                          outlined
                          @update:model-value="handleRoleChange"
                        />
                      </VCol>

                      <!-- Unit Selections -->
                      <VCol
                        v-if="selectedRole"
                        cols="9"
                      >
                        <div class="d-flex align-center gap-4">
                          <!-- Unit scope -->
                          <VSelect
                            v-if="currentScopeModel === 'unit'"
                            v-model="selectedModel"
                            :items="units"
                            item-title="nama_unit"
                            item-value="id"
                            label="Unit"
                            dense
                            outlined
                            style="inline-size: 200px;"
                          />

                          <!-- Sub-unit scope -->
                          <template v-if="currentScopeModel === 'sub-unit'">
                            <VSelect
                              v-model="tempUnit"
                              :items="units"
                              item-title="nama_unit"
                              item-value="id"
                              label="Unit"
                              dense
                              outlined
                              style="inline-size: 200px;"
                              @update:model-value="fetchSubUnits"
                            />
                            <VSelect
                              v-model="selectedModel"
                              :items="subUnits"
                              item-title="nama_subunit"
                              item-value="id"
                              label="Sub Unit"
                              dense
                              outlined
                              :disabled="!tempUnit"
                              style="inline-size: 200px;"
                            />
                          </template>

                          <!-- Sub-sub-unit scope -->
                          <template v-if="currentScopeModel === 'sub-sub-unit'">
                            <VSelect
                              v-model="tempUnit"
                              :items="units"
                              item-title="nama_unit"
                              item-value="id"
                              label="Unit"
                              dense
                              outlined
                              style="inline-size: 200px;"
                              @update:model-value="fetchSubUnits"
                            />
                            <VSelect
                              v-model="tempSubUnit"
                              :items="subUnits"
                              item-title="nama_subunit"
                              item-value="id"
                              label="Sub Unit"
                              dense
                              outlined
                              :disabled="!tempUnit"
                              style="inline-size: 200px;"
                              @update:model-value="fetchSubSubUnits"
                            />
                            <VSelect
                              v-model="selectedModel"
                              :items="subSubUnits"
                              item-title="nama_subsubunit"
                              item-value="id"
                              label="Sub Sub Unit"
                              dense
                              outlined
                              :disabled="!tempSubUnit"
                              style="inline-size: 200px;"
                            />
                          </template>

                          <VBtn
                            color="primary"
                            :disabled="!canAddRole"
                            @click="addUserRole"
                          >
                            Tambah Role
                          </VBtn>
                        </div>
                      </VCol>
                    </VRow>
                  </VCol>
                </VRow>
              </VCol>

              <!-- Dynamic Unit Selection based on scope_model -->
              <!--
                <template v-if="selectedRole && selectedRole.scope_model === 'unit'">
                <VCol cols="12">
                <VSelect
                v-model="editedItem.unit_id"
                :items="units"
                item-title="nama_unit"
                item-value="id"
                label="Unit"
                dense
                outlined
                />
                </VCol>
                </template>

                <template v-if="selectedRole && selectedRole.scope_model === 'sub-unit'">
                <VCol cols="12" sm="6">
                <VSelect
                v-model="editedItem.unit_id"
                :items="units"
                item-title="nama_unit"
                item-value="id"
                label="Unit"
                dense
                outlined
                @update:model-value="fetchSubUnits"
                />
                </VCol>
                <VCol cols="12" sm="6">
                <VSelect
                v-model="editedItem.subunit_id"
                :items="subUnits"
                item-title="nama_subunit"
                item-value="id"
                label="Sub Unit"
                dense
                outlined
                :disabled="!editedItem.unit_id"
                />
                </VCol>
                </template>

                <template v-if="selectedRole && selectedRole.scope_model === 'sub-sub-unit'">
                <VCol cols="12" sm="4">
                <VSelect
                v-model="editedItem.unit_id"
                :items="units"
                item-title="nama_unit"
                item-value="id"
                label="Unit"
                dense
                outlined
                @update:model-value="fetchSubUnits"
                />
                </VCol>
                <VCol cols="12" sm="4">
                <VSelect
                v-model="editedItem.subunit_id"
                :items="subUnits"
                item-title="nama_subunit"
                item-value="id"
                label="Sub Unit"
                dense
                outlined
                :disabled="!editedItem.unit_id"
                @update:model-value="fetchSubSubUnits"
                />
                </VCol>
                <VCol cols="12" sm="4">
                <VSelect
                v-model="editedItem.subsubunit_id"
                :items="subSubUnits"
                item-title="nama_subsubunit"
                item-value="id"
                label="Sub Sub Unit"
                dense
                outlined
                :disabled="!editedItem.subunit_id"
                />
                </VCol>
                </template>
              -->
            </VRow>
          </VContainer>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="blue darken-1"
            text
            @click="close"
          >
            Cancel
          </VBtn>
          <VBtn
            color="blue darken-1"
            text
            @click="save"
          >
            Save
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirmation Dialog -->
    <VDialog
      v-model="dialogDelete"
      persistent
      max-width="290"
    >
      <VCard>
        <VCardTitle class="text-h5">
          Are you sure you want to delete this item?
        </VCardTitle>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="blue darken-1"
            text
            @click="closeDelete"
          >
            Cancel
          </VBtn>
          <VBtn
            color="blue darken-1"
            text
            @click="deleteItem(editedItem)"
          >
            OK
          </VBtn>
          <VSpacer />
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Add snackbar component -->
    <VSnackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      {{ snackbar.message }}
    </VSnackbar>
  </div>
</template>
