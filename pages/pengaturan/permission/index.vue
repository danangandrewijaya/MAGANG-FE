<script setup lang="ts">
import { useGqlMutation } from '@/composables/graphql/useGqlMutation'
import { useGqlQuery } from '@/composables/graphql/useGqlQuery'
import { computed, onMounted, ref } from 'vue'
import { VIcon } from 'vuetify/components'

// State
const roles = ref<any[]>([])
const selectedRole = ref<any>(null)
const resolvers = ref<any[]>([])
const activeResolvers = ref<any[]>([])
const isLoadingRoles = ref(false)
const isLoadingResolvers = ref(false)
const searchRole = ref('')
const searchResolver = ref('')
const isSyncingPermissions = ref(false)

// Fetch active resolvers for selected role (dummy, replace with real query if available)
const fetchActiveResolvers = async (role: any) => {
  if (!role?.id) {
    activeResolvers.value = []

    return
  }
  const { data, error, refetch } = useGqlQuery('role_resolver', 'get', { roleId: Number.parseInt(role.id) })

  await refetch()
  if (!error.value && data.value)
    activeResolvers.value = data.value.map((item: any) => item.resolverPermission)
  else
    activeResolvers.value = []
}

// Fetch roles (reuse role list from userQuery)
const fetchRoles = async () => {
  isLoadingRoles.value = true

  const { data, error, refetch } = useGqlQuery('role', 'get', { take: 100 })

  await refetch()
  if (!error.value)
    roles.value = data.value || []

  // Otomatis pilih role pertama jika belum ada yang dipilih
  if (!selectedRole.value && roles.value.length > 0) {
    selectedRole.value = roles.value[0]
    fetchActiveResolvers(selectedRole.value)
  }
  isLoadingRoles.value = false
}

// Fetch all resolvers
const fetchResolvers = async () => {
  isLoadingResolvers.value = true

  // , search: searchResolver.value
  const { data, error, refetch } = useGqlQuery('permission_resolver', 'get', { limit: 1000 })

  await refetch()
  if (!error.value)
    resolvers.value = data.value || []
  isLoadingResolvers.value = false
}

onMounted(() => {
  fetchRoles()
  fetchResolvers()
})

const selectRole = (role: any) => {
  selectedRole.value = role
  fetchActiveResolvers(role)
}

const addResolver = (resolver: any) => {
  if (!activeResolvers.value.find((r: any) => r.id === resolver.id))
    activeResolvers.value.push(resolver)
}

const removeResolver = (resolver: any) => {
  activeResolvers.value = activeResolvers.value.filter((r: any) => r.id !== resolver.id)
}

const isResolverActive = (resolver: any) => {
  return !!activeResolvers.value.find((r: any) => r.id === resolver.id)
}

// Group resolvers by group and type
const groupByType = (resolversArr: any[]) => {
  return {
    Query: resolversArr.filter(r => r.type === 'Query'),
    Mutation: resolversArr.filter(r => r.type === 'Mutation'),
  }
}

const groupedResolvers = computed(() => {
  const groups: Record<string, { Query: any[]; Mutation: any[] }> = {}

  console.log('Resolvers:', resolvers.value)
  resolvers.value.forEach(resolver => {
    const group = resolver.group?.name || 'Lainnya'
    if (!groups[group])
      groups[group] = { Query: [], Mutation: [] }
    if (resolver.type === 'QUERY')
      groups[group].Query.push(resolver)
    else if (resolver.type === 'MUTATION')
      groups[group].Mutation.push(resolver)
  })
  console.log('Grouped resolvers:', groups)

  return groups
})

const groupedActiveResolvers = computed(() => {
  const groups: Record<string, { Query: any[]; Mutation: any[] }> = {}

  activeResolvers.value.forEach(resolver => {
    const group = resolver.group?.name || 'Lainnya'
    if (!groups[group])
      groups[group] = { Query: [], Mutation: [] }
    if (resolver.type === 'QUERY')
      groups[group].Query.push(resolver)
    else if (resolver.type === 'MUTATION')
      groups[group].Mutation.push(resolver)
  })

  return groups
})

// Track expanded/collapsed state per group
const expandedGroups = ref<Record<string, boolean>>({})

const toggleGroup = (group: string) => {
  expandedGroups.value[group] = !expandedGroups.value[group]
  console.log('Toggled group:', group, 'Expanded:', expandedGroups.value[group])
}

const expandedActiveGroups = ref<Record<string, boolean>>({})

const toggleActiveGroup = (group: string) => {
  expandedActiveGroups.value[group] = !expandedActiveGroups.value[group]
}

// Checklist per group
const isAllGroupSelected = (groupResolvers: any[]) => {
  return groupResolvers.every(r => isResolverActive(r))
}

const toggleSelectGroup = (groupResolvers: any[]) => {
  if (isAllGroupSelected(groupResolvers)) {
    // Deselect all
    groupResolvers.forEach(r => removeResolver(r))
  }
  else {
    // Select all
    groupResolvers.forEach(r => addResolver(r))
  }
}

const { execute: updateRoleResolvers } = useGqlMutation('role_resolver', 'update')

const saveRoleResolvers = async () => {
  if (!selectedRole.value)
    return
  const permissionIds = activeResolvers.value.map((r: any) => Number.parseInt(r.id))
  try {
    await updateRoleResolvers({ permissionIds, roleId: Number.parseInt(selectedRole.value.id) })

    // Optionally show snackbar or reload data
  }
  catch (e) {
    // Optionally show error
  }
}

const { execute: syncPermissions } = useGqlMutation('permission', 'update', {
  customSuccessMessage: 'Permission berhasil disinkronisasi',
})

const handleSyncPermissions = async () => {
  isSyncingPermissions.value = true
  try {
    await syncPermissions()

    // Optionally show snackbar or reload data
  }
  catch (e) {
    // Optionally show error
  }
  isSyncingPermissions.value = false
}

console.log('expandedGroups', expandedGroups.value)
</script>

<template>
  <div style=" display: flex; justify-content: flex-end;margin-block-end: 16px;">
    <VBtn color="info" :loading="isSyncingPermissions" @click="handleSyncPermissions">
      <VIcon>bx-sync</VIcon>
      Sinkron Permission
    </VBtn>
  </div>
  <VRow>
    <VCol cols="12" md="4">
      <VCard>
        <VCardTitle>Pilih Role</VCardTitle>
        <VCardText>
          <VTextField v-model="searchRole" label="Cari Role" />
          <VList>
            <VListItem v-for="role in roles" :key="role.id" :active="selectedRole?.id === role.id"
              @click="selectRole(role)">
              {{ role.name }}
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12" md="8">
      <VCard>
        <VCardTitle>Manajemen Resolver untuk Role: <b>{{ selectedRole?.name || '-' }}</b></VCardTitle>
        <VCardText>
          <h4>Daftar Resolver</h4>
          <VTextField v-model="searchResolver" label="Cari Resolver" @keyup.enter="fetchResolvers" />
          <VList>
            <template v-for="(resolversInGroup, groupName) in groupedResolvers" :key="groupName">
              <div class="resolver-group-header" @click="toggleGroup(groupName)">
                <span style="display: flex; align-items: center; cursor: pointer;">
                  <VIcon v-if="expandedGroups[groupName]">bx-down-arrow</VIcon>
                  <VIcon v-else>bx-right-arrow</VIcon>
                </span>
                <VCheckbox :model-value="isAllGroupSelected([...resolversInGroup.Query, ...resolversInGroup.Mutation])"
                  hide-details style="margin-inline-end: 8px;" @click.stop
                  @change="toggleSelectGroup([...resolversInGroup.Query, ...resolversInGroup.Mutation])" />
                <span>{{ groupName }}</span>
              </div>
              <template v-if="expandedGroups[groupName]">
                <div v-if="resolversInGroup.Query.length" style="margin-inline-start: 24px;">
                  <div class="resolver-type-label">
                    Query
                  </div>
                  <VListItem v-for="resolver in resolversInGroup.Query" :key="resolver.id" :class="{
                    'resolver-active': isResolverActive(resolver),
                    'resolver-hover': !isResolverActive(resolver),
                  }" @click="isResolverActive(resolver) ? removeResolver(resolver) : addResolver(resolver)">
                    {{ resolver.resolverName }} <span class="text-caption">({{ resolver.type }})</span>
                  </VListItem>
                </div>
                <div v-if="resolversInGroup.Mutation.length" style="margin-inline-start: 24px;">
                  <div class="resolver-type-label">
                    Mutation
                  </div>
                  <VListItem v-for="resolver in resolversInGroup.Mutation" :key="resolver.id" :class="{
                    'resolver-active': isResolverActive(resolver),
                    'resolver-hover': !isResolverActive(resolver),
                  }" @click="isResolverActive(resolver) ? removeResolver(resolver) : addResolver(resolver)">
                    {{ resolver.resolverName }} <span class="text-caption">({{ resolver.type }})</span>
                  </VListItem>
                </div>
              </template>
            </template>
          </VList>
        </VCardText>
        <VCol cols="12">
          <VBtn color="primary" @click="saveRoleResolvers">
            Simpan
          </VBtn>
        </VCol>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.resolver-active {
  background-color: #e3f2fd !important;
  color: #1976d2 !important;
}

.resolver-hover:hover {
  background-color: #f5f5f5 !important;
  color: #333 !important;
}

.resolver-group {
  margin-block-end: 1rem;
}

.resolver-group-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  gap: 0.5rem;
  margin-block-end: 1rem;
}

.resolver-type-label {
  color: #1976d2;
  font-size: 0.95em;
  font-weight: 600;
  margin-block: 0.5rem 0.5rem;
}
</style>
