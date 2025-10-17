<script setup lang="ts">
import { jwtDecode } from 'jwt-decode'
import { computed, onMounted, ref } from 'vue'
import { useGqlMutation } from '@/composables/graphql/useGqlMutation'
import { useGqlQuery } from '@/composables/graphql/useGqlQuery'
import { useSessionStore } from '@/stores/session'
import { clearRedirectUrl, getRedirectUrl } from '~/utils/redirectUrl'

const session = useSessionStore()

const user = computed(() => session.activeUser)
const isLoadingMe = ref(true)
const userRoles = ref<any[]>([])
const me = ref<any>(null)
const errorMe = ref<any>(null)

// Load initial data
onMounted(async () => {
  isLoadingMe.value = true

  try {
    const { data, error, refetch } = useGqlQuery('me', 'first', {}, { cachePolicy: 'no-cache', firstExecution: true })

    await refetch()

    if (error.value) {
      errorMe.value = error.value
      showSnackbar(`Gagal memuat data user: ${error.value?.message || 'Unknown error'}`, 'error')

      return
    }

    me.value = data.value
    userRoles.value = me.value?.userRole?.slice().sort((a: any, b: any) => a.role.name.localeCompare(b.role.name)) || []
  }
  catch (err: any) {
    errorMe.value = err
    showSnackbar(`Error fetching user data: ${err.message || err}`, 'error')
  }
  finally {
    isLoadingMe.value = false
  }
})

// Fungsi untuk memformat menu dari hasil query
const formatMenu = (menuItems: any[]): any[] => {
  return menuItems.map(item => {
    const formattedItem: any = {
      title: item.label,
      icon: item.icon ? { icon: item.icon } : null,
    }

    if (item.to && (!item.children || item.children.length === 0))
      formattedItem.to = { name: item.to }

    if (item.children && item.children.length > 0)
      formattedItem.children = formatMenu(item.children)

    return formattedItem
  })
}

// Ambil menu berdasarkan role aktif
const fetchMenuByRole = async (roleName: string) => {
  const { data, error, refetch } = useGqlQuery('menu_by_role', 'get', { roleName }, { cachePolicy: 'no-cache', firstExecution: false })

  await refetch({ roleName })

  if (error.value) {
    showSnackbar(`Gagal memuat menu: ${error.value?.message || 'Unknown error'}`, 'error')

    return []
  }

  if (data.value)
    return formatMenu(data.value)

  return []
}

// Panggil fungsi fetchMenuByRole saat role berubah
const handleSelectRole = async (userRole: any) => {
  const { data, error, execute } = useGqlMutation('select_role', 'upsert', { showSuccessMessage: false })

  await execute({ data: { userRoleId: Number.parseInt(userRole.id) } })

  if (error.value) {
    showSnackbar(`Gagal memilih role: ${error.value?.message || 'Unknown error'}`, 'error')

    return
  }

  const token = data.value?.token
  if (!token) {
    showSnackbar('Token tidak ditemukan setelah memilih role.', 'error')

    return
  }

  const payload: any = jwtDecode(token)
  const tahunAktif = String(Number.parseInt(payload?.setting?.tahun_aktif) || 2025)

  session.setToken(token)

  // Fetch menu untuk role yang dipilih
  const menuData = await fetchMenuByRole(userRole.role.name)

  session.setActiveUser({
    id: me.value?.id,
    uuid: me.value?.uuid || '', // Add uuid property
    ssoIdentity: me.value?.ssoIdentity || '', // Add ssoIdentity property
    userRoleId: userRole.id,
    role: userRole.role.code,
    roleName: userRole.role.name,
    scopedModel: userRole.scopedModel,
    selectedRole: userRole,
    name: me.value?.name,
    email: me.value?.email,
    tahunAktif,
    menu: menuData,
  })

  // Cek apakah ada redirect URL yang tersimpan dan role adalah verifikator
  const redirectUrl = getRedirectUrl()
  const isVerifikator = userRole.role.code === 'ppk' || userRole.role.name.toLowerCase().includes('ppk')

  if (redirectUrl && isVerifikator) {
    // Hapus redirect URL dari cookies
    clearRedirectUrl()

    // Redirect ke URL yang tersimpan
    navigateTo(redirectUrl)
  }
  else {
    // Redirect normal ke home
    navigateTo('/')
  }

  setTimeout(() => {
    window.location.reload()
  }, 100)
}
</script>

<template>
  <VRow
    v-if="userRoles.length > 0 && !isLoadingMe"
    class="match-height"
  >
    <VCol
      v-for="role in userRoles"
      :key="role.id"
      class="pt-8"
      cols="12"
      lg="4"
      sm="6"
    >
      <Role
        v-bind="role"
        :selected="parseInt(role.id) === parseInt(user?.userRoleId || '')"
        @select-role="handleSelectRole"
      />
    </VCol>
  </VRow>
  <VRow
    v-else-if="isLoadingMe"
    class="match-height"
  >
    <VCol
      v-for="n in 3"
      :key="n"
      class="pt-8"
      cols="12"
      lg="4"
      sm="6"
    >
      <VSkeletonLoader type="card" />
    </VCol>
  </VRow>
  <VAlert
    v-else
    type="info"
    class="mt-8"
  >
    Role belum di set. Silahkan hubungi Admin.
  </VAlert>
</template>

<style
  lang="scss"
  scoped
>
.role-card {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  &.selected-card {
    border: 1px solid;
    border-color: rgba(var(--v-theme-primary), 0.5);
    box-shadow: 0 4px 10px rgba(var(--v-theme-primary), 0.2) !important;
    transform: translateY(-5px);
  }
}
</style>
