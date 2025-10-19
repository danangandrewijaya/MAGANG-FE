# Dokumentasi Pengembangan Aplikasi SIMONEV

## 📋 Daftar Isi
- [Gambaran Umum](#gambaran-umum)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Struktur Proyek](#struktur-proyek)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Pengembangan](#pengembangan)
- [Build dan Deployment](#build-dan-deployment)
- [Panduan Coding](#panduan-coding)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Gambaran Umum

**SIMONEV** adalah aplikasi monitoring dan evaluasi (New Sikontrak) yang dibangun menggunakan Nuxt 3 dengan Vuetify sebagai UI framework. Aplikasi ini menggunakan GraphQL untuk komunikasi API dan menerapkan autentikasi berbasis JWT.

### Fitur Utama
- 🔐 Autentikasi & Otorisasi (JWT + CASL)
- 📊 Dashboard monitoring
- 📝 Manajemen kontrak
- 👥 Manajemen user dan role
- 🎨 Theming (Light/Dark mode)
- 🌐 Multi-language support (i18n)
- 📱 Responsive design
- 📈 Visualisasi data dengan Chart.js & ApexCharts

---

## 🛠️ Teknologi yang Digunakan

### Core Framework
- **Nuxt 3** (v3.12.2) - Framework Vue.js untuk SSR/SPA
- **Vue 3** (v3.3.13) - Progressive JavaScript Framework
- **TypeScript** (v5.5.2) - JavaScript dengan static typing

### UI Framework & Styling
- **Vuetify** (v3.6.10) - Material Design Component Framework
- **SCSS/Sass** - CSS Preprocessor
- **Tailwind-like utilities** - Melalui Vuetify

### State Management & Data
- **Pinia** (v2.1.7) - Vue Store
- **Pinia Persistedstate** - Persist Pinia state ke localStorage
- **Apollo Client** (@nuxtjs/apollo) - GraphQL Client
- **VueUse** (v10.11.0) - Collection of Vue Composition Utilities

### Authentication & Authorization
- **CASL** (v6.7.1) - Authorization library
- **JWT Decode** (v4.0.0) - JWT token decoder
- **Crypto-js** - Enkripsi data

### Rich Text & Forms
- **TipTap** (v2.4.0+) - Headless WYSIWYG editor
- **FormKit Drag and Drop** - Drag and drop functionality
- **Vue Flatpickr** - Date picker component

### Charts & Visualization
- **ApexCharts** (v3.49.2) - Modern charting library
- **Chart.js** (v4.4.3) - Simple yet flexible JavaScript charting
- **Vue3 Lottie** - Lottie animation untuk Vue 3

### Development Tools
- **ESLint** - Linting JavaScript/TypeScript
- **Stylelint** - Linting CSS/SCSS
- **TypeScript ESLint** - TypeScript linting rules
- **Vite** (v5.3.1) - Build tool dan dev server

### Utilities
- **@vueuse/core** - Vue Composition API utilities
- **@iconify/vue** - Icon framework
- **webfontloader** - Web font loader
- **ufo** - URL utilities
- **ofetch** - HTTP request library

---

## 📦 Prasyarat

Pastikan sistem Anda sudah terinstall:

- **Node.js**: versi 18.x atau lebih tinggi
- **npm**: versi 9.x atau lebih tinggi (atau yarn/pnpm)
- **Git**: untuk version control
- **VS Code** (Rekomendasi): dengan extensi Volar

### VS Code Extensions (Rekomendasi)
```
- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- ESLint
- Stylelint
- Prettier
- GraphQL
```

---

## 🚀 Instalasi

### 1. Clone Repository
```powershell
git clone <repository-url>
cd MAGANG-FE
```

### 2. Install Dependencies
```powershell
npm install
```

Perintah ini akan:
- Menginstall semua dependencies dari `package.json`
- Menjalankan `nuxt prepare` (generate types)
- Build icon set dengan `npm run build:icons`

### 3. Setup Environment Variables
Buat file `.env` di root directory:
```powershell
Copy-Item .env.example .env
```

Edit file `.env` sesuai konfigurasi:
```env
# Application
NUXT_PUBLIC_APP_CODE=SIMONEV
NUXT_APP_BASE_URL=/

# API Configuration
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Auth Configuration
AUTH_SECRET=your-secret-key-here
```

---

## ⚙️ Konfigurasi

### Environment Variables

| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `NUXT_PUBLIC_APP_CODE` | Kode aplikasi | SIMONEV |
| `NUXT_PUBLIC_API_BASE_URL` | Base URL API GraphQL | http://localhost:3001 |
| `NUXT_APP_BASE_URL` | Base URL aplikasi | / |
| `AUTH_SECRET` | Secret key untuk JWT | - |

### Theme Configuration

Edit `themeConfig.ts` untuk mengubah konfigurasi tema:

```typescript
export const { themeConfig, layoutConfig } = defineThemeConfig({
  app: {
    title: 'simonev',
    contentWidth: ContentWidth.Boxed, // atau ContentWidth.Fluid
    contentLayoutNav: AppContentLayoutNav.Vertical, // atau Horizontal
    theme: 'light', // atau 'dark'
    skin: Skins.Default, // atau Skins.Bordered
  },
  navbar: {
    type: NavbarType.Sticky, // atau NavbarType.Static
    navbarBlur: true,
  },
  footer: { 
    type: FooterType.Static 
  },
})
```

### Nuxt Configuration

File `nuxt.config.ts` berisi konfigurasi utama:

```typescript
export default defineNuxtConfig({
  ssr: false, // SPA mode
  router: {
    options: {
      hashMode: true, // Hash routing (#/)
    },
  },
  // ... konfigurasi lainnya
})
```

---

## 📁 Struktur Proyek

```
MAGANG-FE/
│
├── @core/                      # Core framework components
│   ├── components/             # Reusable core components
│   ├── composable/             # Core composables
│   ├── libs/                   # Library integrations
│   ├── scss/                   # Core styles
│   ├── stores/                 # Core stores
│   └── utils/                  # Core utilities
│
├── @layouts/                   # Layout system
│   ├── components/             # Layout components
│   │   ├── HorizontalNav.vue   # Horizontal navigation
│   │   ├── VerticalNav.vue     # Vertical navigation
│   │   └── ...
│   ├── plugins/                # Layout plugins
│   └── styles/                 # Layout styles
│
├── assets/                     # Static assets
│   ├── images/                 # Images
│   └── styles/                 # Global styles
│
├── components/                 # App components
│   ├── cards/                  # Card components
│   ├── dialogs/                # Dialog components
│   ├── forms/                  # Form components
│   └── ...
│
├── composables/                # Vue composables
│   ├── useApi.ts               # API composable
│   ├── useConfirmDialog.ts     # Confirmation dialog
│   ├── useFileUpload.ts        # File upload utility
│   ├── useLoading.ts           # Loading state
│   ├── useSnackbar.ts          # Snackbar notifications
│   └── graphql/                # GraphQL composables
│
├── graphql/                    # GraphQL definitions
│   ├── modules/                # GraphQL modules
│   └── index.ts                # GraphQL exports
│
├── layouts/                    # Page layouts
│   ├── default.vue             # Default layout
│   ├── blank.vue               # Blank layout (login, etc)
│   └── components/             # Layout-specific components
│
├── middleware/                 # Route middleware
│   └── auth.global.ts          # Global auth middleware
│
├── navigation/                 # Navigation configuration
│   ├── horizontal/             # Horizontal menu config
│   └── vertical/               # Vertical menu config
│
├── pages/                      # Application pages (auto-routing)
│   ├── index.vue               # Home page
│   ├── login/                  # Login pages
│   ├── kontrak/                # Kontrak pages
│   ├── pengaturan/             # Settings pages
│   └── ...
│
├── plugins/                    # Nuxt plugins
│   ├── vuetify/                # Vuetify configuration
│   ├── iconify/                # Iconify setup
│   ├── apollo-upload.client.ts # Apollo upload plugin
│   └── ...
│
├── server/                     # Server-side code
│   └── plugins/                # Server plugins
│
├── stores/                     # Pinia stores
│   └── session.ts              # User session store
│
├── types/                      # TypeScript types
│   └── fileUpload.ts           # Type definitions
│
├── utils/                      # Utility functions
│   ├── api.ts                  # API utilities
│   ├── constants.ts            # App constants
│   ├── encrypt.ts              # Encryption utilities
│   └── graphql/                # GraphQL utilities
│
├── views/                      # View components
│   └── pages/                  # Page-specific views
│
├── app.vue                     # Root component
├── error.vue                   # Error page
├── nuxt.config.ts              # Nuxt configuration
├── themeConfig.ts              # Theme configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```

### Penjelasan Folder Penting

#### `@core/`
Core framework yang menyediakan komponen, utility, dan styling dasar yang dapat digunakan di seluruh aplikasi.

#### `@layouts/`
Sistem layout yang fleksibel dengan support untuk horizontal dan vertical navigation.

#### `composables/`
Vue 3 composables untuk logic reusable:
- `useApi()` - HTTP requests dengan error handling
- `useSnackbar()` - Show notifications
- `useConfirmDialog()` - Confirmation dialogs
- `useLoading()` - Loading states
- `useFileUpload()` - File upload handling

#### `graphql/`
GraphQL queries, mutations, dan subscriptions yang terorganisir berdasarkan modul.

#### `pages/`
Nuxt auto-routing. Setiap file `.vue` otomatis menjadi route.

#### `stores/`
Pinia stores untuk state management global.

---

## 🏃 Menjalankan Aplikasi

### Development Mode

```powershell
npm run dev
```

Aplikasi akan berjalan di: `http://localhost:3000` (atau port lain jika 3000 sudah digunakan)

**Features in Dev Mode:**
- 🔥 Hot Module Replacement (HMR)
- 🐛 Source maps untuk debugging
- 🛠️ Nuxt DevTools
- ⚡ Fast refresh

### Production Build

```powershell
# Build aplikasi
npm run build

# Preview production build
npm run preview
```

### Static Generation

```powershell
npm run generate
```

Menghasilkan static files di folder `.output/public/`

---

## 💻 Pengembangan

### Membuat Halaman Baru

1. **Buat file di folder `pages/`**

```vue
<!-- pages/produk/index.vue -->
<script setup lang="ts">
definePageMeta({
  title: 'Daftar Produk',
  middleware: ['auth'], // Proteksi dengan auth
})

const { data, pending } = await useAsyncData('products', () => 
  $fetch('/api/products')
)
</script>

<template>
  <div>
    <h1>Daftar Produk</h1>
    <div v-if="pending">Loading...</div>
    <div v-else>
      <!-- Content -->
    </div>
  </div>
</template>
```

Route otomatis: `/produk`

2. **Tambahkan ke Navigation**

```typescript
// navigation/vertical/index.ts
export default [
  {
    title: 'Produk',
    icon: { icon: 'bx-package' },
    to: '/produk',
  },
]
```

### Membuat Component

```vue
<!-- components/ProductCard.vue -->
<script setup lang="ts">
interface Props {
  title: string
  price: number
  image?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <VCard @click="emit('click')">
    <VImg
      v-if="image"
      :src="image"
      height="200"
    />
    <VCardTitle>{{ title }}</VCardTitle>
    <VCardText>
      Rp {{ price.toLocaleString('id-ID') }}
    </VCardText>
  </VCard>
</template>
```

### GraphQL Integration

1. **Buat GraphQL Query**

```typescript
// graphql/modules/product/queries.ts
import gql from 'graphql-tag'

export const GET_PRODUCTS = gql`
  query GetProducts($filter: ProductFilter) {
    products(filter: $filter) {
      id
      name
      price
      stock
    }
  }
`
```

2. **Gunakan di Component**

```vue
<script setup lang="ts">
import { GET_PRODUCTS } from '@/graphql/modules/product/queries'

// Prefer project composable wrapper for GraphQL queries
const { data, loading, error } = useGqlQuery('product', 'get', () => ({ filter: { active: true } }))

const products = computed(() => data.value?.products ?? [])
</script>
```

### State Management dengan Pinia

```typescript
// stores/cart.ts
import { defineStore } from 'pinia'

interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    total: (state) => 
      state.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      ),
    
    itemCount: (state) => 
      state.items.reduce((sum, item) => 
        sum + item.quantity, 0
      ),
  },

  actions: {
    addItem(item: CartItem) {
      const existing = this.items.find(i => i.id === item.id)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        this.items.push(item)
      }
    },

    removeItem(id: string) {
      const index = this.items.findIndex(i => i.id === id)
      if (index > -1) {
        this.items.splice(index, 1)
      }
    },

    clear() {
      this.items = []
    },
  },

  persist: true, // Auto-save ke localStorage
})
```

**Gunakan Store:**

```vue
<script setup lang="ts">
const cartStore = useCartStore()

function addToCart(product) {
  cartStore.addItem({
    id: product.id,
    name: product.name,
    quantity: 1,
    price: product.price,
  })
}
</script>

<template>
  <div>
    <VBtn @click="addToCart(product)">
      Add to Cart ({{ cartStore.itemCount }})
    </VBtn>
  </div>
</template>
```

### Form Handling

```vue
<script setup lang="ts">
const form = ref({
  name: '',
  email: '',
  password: '',
})

const rules = {
  name: [(v: string) => !!v || 'Nama wajib diisi'],
  email: [
    (v: string) => !!v || 'Email wajib diisi',
    (v: string) => /.+@.+\..+/.test(v) || 'Email tidak valid',
  ],
  password: [
    (v: string) => !!v || 'Password wajib diisi',
    (v: string) => v.length >= 8 || 'Password minimal 8 karakter',
  ],
}

const formRef = ref()
const loading = ref(false)

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: form.value,
    })
    
    // Show success message
    useSnackbar().show({
      message: 'User berhasil dibuat',
      color: 'success',
    })
  } catch (error) {
    useSnackbar().show({
      message: 'Terjadi kesalahan',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <VForm ref="formRef" @submit.prevent="submit">
    <VTextField
      v-model="form.name"
      label="Nama"
      :rules="rules.name"
    />
    
    <VTextField
      v-model="form.email"
      label="Email"
      type="email"
      :rules="rules.email"
    />
    
    <VTextField
      v-model="form.password"
      label="Password"
      type="password"
      :rules="rules.password"
    />
    
    <VBtn
      type="submit"
      :loading="loading"
      color="primary"
    >
      Submit
    </VBtn>
  </VForm>
</template>
```

### File Upload

```vue
<script setup lang="ts">
const { uploadFile, uploading, progress } = useFileUpload()

async function handleFileSelect(file: File) {
  try {
    const result = await uploadFile(file, {
      path: '/uploads/documents',
    })
    
    console.log('File uploaded:', result.url)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
</script>

<template>
  <VFileInput
    label="Upload File"
    @change="handleFileSelect"
    :loading="uploading"
  />
  
  <VProgressLinear
    v-if="uploading"
    :model-value="progress"
  />
</template>
```

---

## 🎨 Panduan Coding

### TypeScript Best Practices

```typescript
// ✅ Good: Explicit types
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

function getUser(id: string): Promise<User> {
  return $fetch(`/api/users/${id}`)
}

// ❌ Bad: Implicit any
function getUser(id) {
  return $fetch(`/api/users/${id}`)
}
```

### Vue 3 Composition API

```vue
<script setup lang="ts">
// ✅ Good: Use composition API
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}

// ❌ Bad: Options API (tidak digunakan dalam project ini)
// export default {
//   data() {
//     return { count: 0 }
//   }
// }
</script>
```

### Component Naming

```typescript
// ✅ Good: PascalCase untuk components
import ProductCard from '@/components/ProductCard.vue'
import UserAvatar from '@/components/UserAvatar.vue'

// ❌ Bad: kebab-case atau camelCase
import productCard from '@/components/product-card.vue'
```

### Composables

```typescript
// ✅ Good: Prefix with 'use'
export function useProductList() {
  const products = ref([])
  const loading = ref(false)
  
  async function fetch() {
    loading.value = true
    try {
      products.value = await $fetch('/api/products')
    } finally {
      loading.value = false
    }
  }
  
  return { products, loading, fetch }
}
```

### Error Handling

```typescript
// ✅ Good: Proper error handling
try {
  const result = await $fetch('/api/endpoint')
  useSnackbar().show({
    message: 'Berhasil',
    color: 'success',
  })
} catch (error) {
  console.error('Error:', error)
  useSnackbar().show({
    message: error?.message || 'Terjadi kesalahan',
    color: 'error',
  })
}

// ❌ Bad: Silent errors
const result = await $fetch('/api/endpoint').catch(() => {})
```

### CSS/SCSS Organization

```scss
// ✅ Good: Scoped styles with proper organization
<style lang="scss" scoped>
.product-card {
  padding: 16px;
  border-radius: 8px;
  
  &__title {
    font-size: 18px;
    font-weight: 600;
  }
  
  &__price {
    color: rgb(var(--v-theme-primary));
  }
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
```

---

## 🏗️ Build dan Deployment

### Build untuk Production

```powershell
# Build aplikasi
npm run build

# Output akan ada di folder .output/
```

### Environment-specific Build

```powershell
# Production
npm run generate -- --dotenv .env.production

# Staging
npm run generate -- --dotenv .env.staging
```

### Deployment Options

#### 1. Static Hosting (Netlify, Vercel, etc.)

```powershell
# Generate static files
npm run generate

# Deploy folder .output/public/
```

#### 2. Node.js Server

```powershell
# Build
npm run build

# Start server
node .output/server/index.mjs
```

#### 3. Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV PORT=3000
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

Build dan run:
```powershell
docker build -t simonev .
docker run -p 3000:3000 simonev
```

---

## 🐛 Troubleshooting

### Issue: Module not found

```powershell
# Clear node_modules dan reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Issue: TypeScript errors

```powershell
# Regenerate types
npm run postinstall
```

### Issue: GraphQL errors

1. Check API endpoint di `.env`
2. Verify token authentication
3. Check GraphQL schema compatibility

### Issue: Build fails

```powershell
# Increase Node.js memory
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Issue: Icons not showing

```powershell
# Rebuild icon set
npm run build:icons
```

### Issue: Hot reload tidak bekerja

1. Restart dev server
2. Clear `.nuxt` folder:
   ```powershell
   Remove-Item -Recurse -Force .nuxt
   npm run dev
   ```

---

## 📚 Referensi

### Dokumentasi Official

- [Nuxt 3](https://nuxt.com/docs)
- [Vue 3](https://vuejs.org/guide/)
- [Vuetify 3](https://vuetifyjs.com/)
- [Pinia](https://pinia.vuejs.org/)
- [VueUse](https://vueuse.org/)
- [Apollo GraphQL](https://www.apollographql.com/docs/react/)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Useful Links

- [Nuxt Modules](https://nuxt.com/modules)
- [Vuetify Components](https://vuetifyjs.com/en/components/all/)
- [Iconify Icons](https://icon-sets.iconify.design/)
- [Vue 3 Composition API](https://vuejs.org/api/composition-api-setup.html)

---

## 👥 Tim Pengembang

Untuk pertanyaan dan dukungan, hubungi tim development.

---

## 📝 Changelog

### Version 1.0.0
- Initial release
- Basic authentication & authorization
- Dashboard implementation
- Contract management module
- User & role management

---

**Last Updated:** October 2025
