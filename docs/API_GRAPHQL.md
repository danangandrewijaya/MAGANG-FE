# Panduan API & GraphQL

## 📋 Daftar Isi
- [Konfigurasi Apollo Client](#konfigurasi-apollo-client)
- [Struktur GraphQL](#struktur-graphql)
- [Membuat Query](#membuat-query)
- [Membuat Mutation](#membuat-mutation)
- [File Upload](#file-upload)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## 🔧 Konfigurasi Apollo Client

Apollo Client dikonfigurasi di `nuxt.config.ts`:

```typescript
apollo: {
  clients: {
    default: {
      httpEndpoint: `${process.env.NUXT_PUBLIC_API_BASE_URL}/graphql`,
      tokenName: 'auth_token',
      authType: 'Bearer',
      authHeader: 'Authorization',
      defaultOptions: {
        mutate: {
          errorPolicy: 'all',
        },
        query: {
          errorPolicy: 'all',
        },
      },
    },
  },
}
```

### Authentication

Token JWT secara otomatis disertakan dalam setiap request jika tersimpan dengan key `auth_token` di localStorage/sessionStorage.

---

## 📁 Struktur GraphQL

```
graphql/
├── index.ts                    # Export semua GraphQL operations
└── modules/
    ├── user/
    │   ├── queries.ts          # User queries
    │   ├── mutations.ts        # User mutations
    │   └── types.ts            # User types
    ├── kontrak/
    │   ├── queries.ts
    │   ├── mutations.ts
    │   └── types.ts
    └── ...
```

### Contoh Structure per Module

```typescript
// graphql/modules/user/types.ts
export interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface UserInput {
  name: string
  email: string
  password: string
  role: string
}
```

```typescript
// graphql/modules/user/queries.ts
import gql from 'graphql-tag'

export const GET_USERS = gql`
  query GetUsers($filter: UserFilter, $pagination: PaginationInput) {
    users(filter: $filter, pagination: $pagination) {
      data {
        id
        name
        email
        role
        createdAt
      }
      meta {
        total
        page
        limit
      }
    }
  }
`

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role
      createdAt
      updatedAt
    }
  }
`
```

```typescript
// graphql/modules/user/mutations.ts
import gql from 'graphql-tag'

export const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
    }
  }
`

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      role
    }
  }
`

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`
```

---

## 🔍 Membuat Query

### Basic Query

```vue
<script setup lang="ts">
import { GET_USERS } from '@/graphql/modules/user/queries'

// Simple query
const { result, loading, error } = useQuery(GET_USERS)

// Computed untuk mengakses data
const users = computed(() => result.value?.users?.data ?? [])
</script>

<template>
  <div>
    <VProgressCircular v-if="loading" indeterminate />
    
    <VAlert v-else-if="error" type="error">
      {{ error.message }}
    </VAlert>
    
    <VList v-else>
      <VListItem
        v-for="user in users"
        :key="user.id"
        :title="user.name"
        :subtitle="user.email"
      />
    </VList>
  </div>
</template>
```

### Query dengan Variables

```vue
<script setup lang="ts">
import { GET_USERS } from '@/graphql/modules/user/queries'

const filter = ref({
  role: 'admin',
  status: 'active',
})

const pagination = ref({
  page: 1,
  limit: 10,
})

const { result, loading, refetch } = useQuery(
  GET_USERS,
  () => ({
    filter: filter.value,
    pagination: pagination.value,
  }),
  {
    fetchPolicy: 'cache-and-network',
  }
)

const users = computed(() => result.value?.users?.data ?? [])
const meta = computed(() => result.value?.users?.meta ?? {})

// Refetch when filter changes
watch([filter, pagination], () => {
  refetch()
})

function nextPage() {
  pagination.value.page++
}
</script>
```

### Query dengan Lazy Loading

```vue
<script setup lang="ts">
import { GET_USER } from '@/graphql/modules/user/queries'

const userId = ref<string | null>(null)

const { result, loading, load } = useLazyQuery(GET_USER)

const user = computed(() => result.value?.user)

async function loadUser(id: string) {
  userId.value = id
  await load(GET_USER, { id })
}
</script>
```

### Manual Query dengan useAsyncQuery

```vue
<script setup lang="ts">
import { GET_USERS } from '@/graphql/modules/user/queries'

const { data, pending, error, refresh } = await useAsyncQuery(GET_USERS)

const users = computed(() => data.value?.users?.data ?? [])
</script>
```

---

## ✏️ Membuat Mutation

### Basic Mutation

```vue
<script setup lang="ts">
import { CREATE_USER } from '@/graphql/modules/user/mutations'
import { GET_USERS } from '@/graphql/modules/user/queries'

const { mutate: createUser, loading, onDone, onError } = useMutation(CREATE_USER)

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'user',
})

async function submit() {
  await createUser(
    {
      input: form.value,
    },
    {
      // Refetch queries after mutation
      refetchQueries: [{ query: GET_USERS }],
      
      // Or update cache manually
      update: (cache, { data }) => {
        // Update cache logic here
      },
    }
  )
}

// Handle success
onDone((result) => {
  useSnackbar().show({
    message: 'User berhasil dibuat',
    color: 'success',
  })
  form.value = { name: '', email: '', password: '', role: 'user' }
})

// Handle error
onError((error) => {
  useSnackbar().show({
    message: error.message,
    color: 'error',
  })
})
</script>

<template>
  <VForm @submit.prevent="submit">
    <VTextField v-model="form.name" label="Name" />
    <VTextField v-model="form.email" label="Email" />
    <VTextField v-model="form.password" label="Password" type="password" />
    <VSelect v-model="form.role" :items="['user', 'admin']" label="Role" />
    
    <VBtn type="submit" :loading="loading">
      Create User
    </VBtn>
  </VForm>
</template>
```

### Mutation dengan Optimistic Response

```vue
<script setup lang="ts">
import { UPDATE_USER } from '@/graphql/modules/user/mutations'

const { mutate: updateUser } = useMutation(UPDATE_USER)

async function updateUserName(userId: string, newName: string) {
  await updateUser(
    {
      id: userId,
      input: { name: newName },
    },
    {
      optimisticResponse: {
        updateUser: {
          __typename: 'User',
          id: userId,
          name: newName,
        },
      },
      update: (cache, { data }) => {
        // Update cache immediately
        cache.modify({
          id: cache.identify({ __typename: 'User', id: userId }),
          fields: {
            name: () => data.updateUser.name,
          },
        })
      },
    }
  )
}
</script>
```

### Delete Mutation

```vue
<script setup lang="ts">
import { DELETE_USER } from '@/graphql/modules/user/mutations'

const { mutate: deleteUser } = useMutation(DELETE_USER)

async function handleDelete(userId: string) {
  const confirmed = await useConfirmDialog().confirm({
    title: 'Hapus User',
    message: 'Apakah Anda yakin ingin menghapus user ini?',
  })
  
  if (!confirmed) return
  
  try {
    await deleteUser(
      { id: userId },
      {
        update: (cache) => {
          // Remove from cache
          cache.evict({ 
            id: cache.identify({ __typename: 'User', id: userId }) 
          })
          cache.gc()
        },
      }
    )
    
    useSnackbar().show({
      message: 'User berhasil dihapus',
      color: 'success',
    })
  } catch (error) {
    useSnackbar().show({
      message: 'Gagal menghapus user',
      color: 'error',
    })
  }
}
</script>
```

---

## 📤 File Upload

### Upload dengan GraphQL

```typescript
// graphql/modules/file/mutations.ts
import gql from 'graphql-tag'

export const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!) {
    uploadFile(file: $file) {
      id
      filename
      mimetype
      url
      size
    }
  }
`
```

### Component Upload

```vue
<script setup lang="ts">
import { UPLOAD_FILE } from '@/graphql/modules/file/mutations'

const { mutate: uploadFile, loading } = useMutation(UPLOAD_FILE)

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    const { data } = await uploadFile({
      file,
    })
    
    console.log('File uploaded:', data.uploadFile)
    
    useSnackbar().show({
      message: 'File berhasil diupload',
      color: 'success',
    })
  } catch (error) {
    useSnackbar().show({
      message: 'Gagal upload file',
      color: 'error',
    })
  }
}
</script>

<template>
  <VFileInput
    label="Upload File"
    @change="handleFileSelect"
    :loading="loading"
  />
</template>
```

### Multiple File Upload

```vue
<script setup lang="ts">
const files = ref<File[]>([])
const uploading = ref(false)
const progress = ref(0)

async function uploadFiles() {
  uploading.value = true
  
  try {
    const uploads = files.value.map(async (file, index) => {
      const { data } = await uploadFile({ file })
      progress.value = ((index + 1) / files.value.length) * 100
      return data.uploadFile
    })
    
    const results = await Promise.all(uploads)
    
    useSnackbar().show({
      message: `${results.length} file berhasil diupload`,
      color: 'success',
    })
  } finally {
    uploading.value = false
    progress.value = 0
  }
}
</script>
```

---

## 🚨 Error Handling

### GraphQL Error Types

```typescript
interface GraphQLError {
  message: string
  extensions?: {
    code: string
    statusCode: number
    [key: string]: any
  }
  locations?: Array<{
    line: number
    column: number
  }>
  path?: string[]
}
```

### Handling Errors

```vue
<script setup lang="ts">
import { GET_USERS } from '@/graphql/modules/user/queries'

const { result, error, onError } = useQuery(GET_USERS)

// Handle specific errors
onError((error) => {
  if (error.graphQLErrors) {
    error.graphQLErrors.forEach((err) => {
      switch (err.extensions?.code) {
        case 'UNAUTHENTICATED':
          // Redirect to login
          navigateTo('/login')
          break
        case 'FORBIDDEN':
          useSnackbar().show({
            message: 'Anda tidak memiliki akses',
            color: 'error',
          })
          break
        default:
          useSnackbar().show({
            message: err.message,
            color: 'error',
          })
      }
    })
  }
  
  if (error.networkError) {
    useSnackbar().show({
      message: 'Tidak dapat terhubung ke server',
      color: 'error',
    })
  }
})
</script>
```

### Global Error Handler

```typescript
// plugins/apollo-error-handler.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('apollo:error', (error) => {
    console.error('Apollo error:', error)
    
    // Handle global errors
    if (error.networkError) {
      useSnackbar().show({
        message: 'Network error',
        color: 'error',
      })
    }
  })
})
```

---

## ✨ Best Practices

### 1. Fragment untuk Reusable Fields

```typescript
// graphql/modules/user/fragments.ts
import gql from 'graphql-tag'

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    email
    role
    avatar
    createdAt
  }
`

// Use in queries
export const GET_USER = gql`
  ${USER_FIELDS}
  
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFields
      profile {
        bio
        phone
      }
    }
  }
`
```

### 2. Pagination Pattern

```vue
<script setup lang="ts">
import { GET_USERS } from '@/graphql/modules/user/queries'

const page = ref(1)
const limit = ref(10)

const { result, loading, fetchMore } = useQuery(
  GET_USERS,
  () => ({
    pagination: { page: page.value, limit: limit.value },
  })
)

const users = computed(() => result.value?.users?.data ?? [])
const meta = computed(() => result.value?.users?.meta)

async function loadMore() {
  page.value++
  
  await fetchMore({
    variables: {
      pagination: { page: page.value, limit: limit.value },
    },
    updateQuery: (prev, { fetchMoreResult }) => {
      if (!fetchMoreResult) return prev
      
      return {
        users: {
          ...fetchMoreResult.users,
          data: [
            ...prev.users.data,
            ...fetchMoreResult.users.data,
          ],
        },
      }
    },
  })
}
</script>
```

### 3. Cache Management

```typescript
// Reset cache after logout
function logout() {
  const { client } = useApolloClient()
  
  // Clear all cache
  client.clearStore()
  
  // Or reset to initial state
  client.resetStore()
  
  navigateTo('/login')
}
```

### 4. Subscription Pattern

```vue
<script setup lang="ts">
import gql from 'graphql-tag'

const MESSAGES_SUBSCRIPTION = gql`
  subscription OnMessageAdded($chatId: ID!) {
    messageAdded(chatId: $chatId) {
      id
      text
      sender {
        id
        name
      }
      createdAt
    }
  }
`

const { result, error } = useSubscription(MESSAGES_SUBSCRIPTION, {
  chatId: 'chat-123',
})

watch(result, (newMessage) => {
  if (newMessage) {
    console.log('New message:', newMessage.messageAdded)
  }
})
</script>
```

### 5. Composable Pattern

```typescript
// composables/graphql/useUsers.ts
import { GET_USERS, GET_USER } from '@/graphql/modules/user/queries'
import { CREATE_USER, UPDATE_USER, DELETE_USER } from '@/graphql/modules/user/mutations'

export function useUsers() {
  const { result, loading, error, refetch } = useQuery(GET_USERS)
  
  const users = computed(() => result.value?.users?.data ?? [])
  
  const { mutate: createUser } = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  })
  
  const { mutate: updateUser } = useMutation(UPDATE_USER)
  const { mutate: deleteUser } = useMutation(DELETE_USER)
  
  return {
    users,
    loading,
    error,
    refetch,
    createUser,
    updateUser,
    deleteUser,
  }
}
```

Gunakan di component:

```vue
<script setup lang="ts">
const { users, loading, createUser } = useUsers()
</script>
```

---

## 📖 Contoh Lengkap: CRUD Module

### 1. Types

```typescript
// graphql/modules/product/types.ts
export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface ProductInput {
  name: string
  description: string
  price: number
  stock: number
  category: string
  images?: string[]
}

export interface ProductFilter {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
}
```

### 2. Queries

```typescript
// graphql/modules/product/queries.ts
import gql from 'graphql-tag'

export const GET_PRODUCTS = gql`
  query GetProducts(
    $filter: ProductFilter
    $pagination: PaginationInput
    $sort: SortInput
  ) {
    products(filter: $filter, pagination: $pagination, sort: $sort) {
      data {
        id
        name
        description
        price
        stock
        category
        images
      }
      meta {
        total
        page
        limit
        hasMore
      }
    }
  }
`

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      stock
      category
      images
      createdAt
      updatedAt
    }
  }
`
```

### 3. Mutations

```typescript
// graphql/modules/product/mutations.ts
import gql from 'graphql-tag'

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
      price
    }
  }
`

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      price
    }
  }
`

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      success
      message
    }
  }
`
```

### 4. Composable

```typescript
// composables/graphql/useProducts.ts
import type { Product, ProductInput, ProductFilter } from '@/graphql/modules/product/types'

export function useProducts(initialFilter?: ProductFilter) {
  const filter = ref(initialFilter || {})
  const pagination = ref({ page: 1, limit: 10 })
  
  const { result, loading, error, refetch } = useQuery(
    GET_PRODUCTS,
    () => ({
      filter: filter.value,
      pagination: pagination.value,
    }),
    {
      fetchPolicy: 'cache-and-network',
    }
  )
  
  const products = computed(() => result.value?.products?.data ?? [])
  const meta = computed(() => result.value?.products?.meta)
  
  const { mutate: createProduct, loading: creating } = useMutation(
    CREATE_PRODUCT,
    {
      refetchQueries: [{ query: GET_PRODUCTS }],
    }
  )
  
  const { mutate: updateProduct, loading: updating } = useMutation(UPDATE_PRODUCT)
  const { mutate: deleteProduct, loading: deleting } = useMutation(DELETE_PRODUCT)
  
  async function create(input: ProductInput) {
    try {
      const { data } = await createProduct({ input })
      useSnackbar().show({
        message: 'Produk berhasil dibuat',
        color: 'success',
      })
      return data.createProduct
    } catch (error) {
      useSnackbar().show({
        message: 'Gagal membuat produk',
        color: 'error',
      })
      throw error
    }
  }
  
  async function update(id: string, input: ProductInput) {
    try {
      const { data } = await updateProduct({ id, input })
      useSnackbar().show({
        message: 'Produk berhasil diupdate',
        color: 'success',
      })
      return data.updateProduct
    } catch (error) {
      useSnackbar().show({
        message: 'Gagal update produk',
        color: 'error',
      })
      throw error
    }
  }
  
  async function remove(id: string) {
    const confirmed = await useConfirmDialog().confirm({
      title: 'Hapus Produk',
      message: 'Apakah Anda yakin ingin menghapus produk ini?',
    })
    
    if (!confirmed) return false
    
    try {
      await deleteProduct({ id })
      await refetch()
      useSnackbar().show({
        message: 'Produk berhasil dihapus',
        color: 'success',
      })
      return true
    } catch (error) {
      useSnackbar().show({
        message: 'Gagal menghapus produk',
        color: 'error',
      })
      return false
    }
  }
  
  return {
    products,
    meta,
    loading,
    error,
    creating,
    updating,
    deleting,
    filter,
    pagination,
    refetch,
    create,
    update,
    remove,
  }
}
```

### 5. Component Usage

```vue
<script setup lang="ts">
const {
  products,
  meta,
  loading,
  filter,
  pagination,
  create,
  update,
  remove,
} = useProducts()

const dialog = ref(false)
const editingProduct = ref<Product | null>(null)

function openDialog(product?: Product) {
  editingProduct.value = product || null
  dialog.value = true
}

async function handleSubmit(data: ProductInput) {
  if (editingProduct.value) {
    await update(editingProduct.value.id, data)
  } else {
    await create(data)
  }
  dialog.value = false
}

async function handleDelete(id: string) {
  await remove(id)
}
</script>

<template>
  <div>
    <VBtn @click="openDialog()">
      Tambah Produk
    </VBtn>
    
    <VDataTable
      :items="products"
      :loading="loading"
      :headers="headers"
    >
      <template #item.actions="{ item }">
        <VBtn
          icon="mdi-pencil"
          size="small"
          @click="openDialog(item)"
        />
        <VBtn
          icon="mdi-delete"
          size="small"
          @click="handleDelete(item.id)"
        />
      </template>
    </VDataTable>
    
    <!-- Product Form Dialog -->
    <ProductFormDialog
      v-model="dialog"
      :product="editingProduct"
      @submit="handleSubmit"
    />
  </div>
</template>
```

---

**Last Updated:** October 2025
