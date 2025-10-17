# Testing & Best Practices

## 📋 Daftar Isi
- [Testing Strategy](#testing-strategy)
- [Unit Testing](#unit-testing)
- [Component Testing](#component-testing)
- [E2E Testing](#e2e-testing)
- [Code Quality](#code-quality)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Performance Tips](#performance-tips)

---

## 🧪 Testing Strategy

### Testing Pyramid

```
        /\
       /  \      E2E Tests (Few)
      /----\     
     /      \    Integration Tests (Some)
    /--------\   
   /          \  Unit Tests (Many)
  /____________\ 
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Component Tests**: Critical components
- **E2E Tests**: Critical user flows

---

## 🔬 Unit Testing

### Setup Vitest

```powershell
npm install -D vitest @vitest/ui @vue/test-utils happy-dom
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.nuxt/',
        'test/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '~': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
```

### Testing Utilities

```typescript
// utils/formatters.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate } from './formatters'

describe('formatCurrency', () => {
  it('formats IDR currency correctly', () => {
    expect(formatCurrency(1000000)).toBe('Rp 1.000.000')
  })

  it('handles zero values', () => {
    expect(formatCurrency(0)).toBe('Rp 0')
  })

  it('handles negative values', () => {
    expect(formatCurrency(-5000)).toBe('-Rp 5.000')
  })
})

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-10-17')
    expect(formatDate(date)).toBe('17 Oktober 2025')
  })

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('-')
  })
})
```

### Testing Composables

```typescript
// composables/useCounter.test.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })

  it('initializes with custom value', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })

  it('increments count', () => {
    const { count, increment } = useCounter()
    increment()
    expect(count.value).toBe(1)
  })

  it('decrements count', () => {
    const { count, decrement } = useCounter(5)
    decrement()
    expect(count.value).toBe(4)
  })

  it('resets count', () => {
    const { count, increment, reset } = useCounter()
    increment()
    increment()
    reset()
    expect(count.value).toBe(0)
  })
})
```

### Testing Stores

```typescript
// stores/cart.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from './cart'

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with empty cart', () => {
    const cart = useCartStore()
    expect(cart.items).toEqual([])
    expect(cart.total).toBe(0)
  })

  it('adds item to cart', () => {
    const cart = useCartStore()
    cart.addItem({
      id: '1',
      name: 'Product',
      price: 10000,
      quantity: 1,
    })
    
    expect(cart.items).toHaveLength(1)
    expect(cart.total).toBe(10000)
  })

  it('increases quantity of existing item', () => {
    const cart = useCartStore()
    const item = {
      id: '1',
      name: 'Product',
      price: 10000,
      quantity: 1,
    }
    
    cart.addItem(item)
    cart.addItem(item)
    
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].quantity).toBe(2)
  })

  it('removes item from cart', () => {
    const cart = useCartStore()
    cart.addItem({
      id: '1',
      name: 'Product',
      price: 10000,
      quantity: 1,
    })
    
    cart.removeItem('1')
    expect(cart.items).toHaveLength(0)
  })

  it('clears cart', () => {
    const cart = useCartStore()
    cart.addItem({
      id: '1',
      name: 'Product',
      price: 10000,
      quantity: 1,
    })
    
    cart.clear()
    expect(cart.items).toEqual([])
  })
})
```

---

## 🧩 Component Testing

### Setup Component Testing

```typescript
// test/setup.ts
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Mock Nuxt composables
config.global.mocks = {
  $t: (key: string) => key,
  useRuntimeConfig: () => ({
    public: {
      apiBaseUrl: 'http://localhost:3001',
    },
  }),
}

// Mock Vuetify
config.global.stubs = {
  VBtn: true,
  VCard: true,
  VTextField: true,
  // ... other Vuetify components
}
```

### Testing Basic Component

```typescript
// components/ProductCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from './ProductCard.vue'

describe('ProductCard', () => {
  const defaultProps = {
    id: '1',
    title: 'Test Product',
    price: 10000,
  }

  it('renders product title', () => {
    const wrapper = mount(ProductCard, {
      props: defaultProps,
    })
    
    expect(wrapper.text()).toContain('Test Product')
  })

  it('formats price correctly', () => {
    const wrapper = mount(ProductCard, {
      props: defaultProps,
    })
    
    expect(wrapper.text()).toContain('Rp 10.000')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(ProductCard, {
      props: defaultProps,
    })
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toEqual(['1'])
  })

  it('shows out of stock badge', () => {
    const wrapper = mount(ProductCard, {
      props: {
        ...defaultProps,
        inStock: false,
      },
    })
    
    expect(wrapper.text()).toContain('Out of Stock')
  })

  it('disables add to cart button when out of stock', () => {
    const wrapper = mount(ProductCard, {
      props: {
        ...defaultProps,
        inStock: false,
      },
    })
    
    const button = wrapper.find('[data-testid="add-to-cart"]')
    expect(button.attributes('disabled')).toBeDefined()
  })
})
```

### Testing Form Component

```typescript
// components/forms/LoginForm.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from './LoginForm.vue'

describe('LoginForm', () => {
  it('validates required fields', async () => {
    const wrapper = mount(LoginForm)
    
    // Try to submit without filling fields
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.text()).toContain('Email wajib diisi')
    expect(wrapper.text()).toContain('Password wajib diisi')
  })

  it('validates email format', async () => {
    const wrapper = mount(LoginForm)
    
    await wrapper.find('[data-testid="email"]').setValue('invalid-email')
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.text()).toContain('Email tidak valid')
  })

  it('submits form with valid data', async () => {
    const onSubmit = vi.fn()
    const wrapper = mount(LoginForm, {
      props: {
        onSubmit,
      },
    })
    
    await wrapper.find('[data-testid="email"]').setValue('test@example.com')
    await wrapper.find('[data-testid="password"]').setValue('password123')
    await wrapper.find('form').trigger('submit')
    
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('shows loading state during submission', async () => {
    const wrapper = mount(LoginForm, {
      props: {
        loading: true,
      },
    })
    
    const button = wrapper.find('[data-testid="submit"]')
    expect(button.attributes('loading')).toBe('true')
    expect(button.attributes('disabled')).toBeDefined()
  })
})
```

### Testing with GraphQL

```typescript
// components/UserList.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { provideApolloClient } from '@vue/apollo-composable'
import { createMockClient } from 'mock-apollo-client'
import UserList from './UserList.vue'
import { GET_USERS } from '@/graphql/modules/user/queries'

describe('UserList', () => {
  it('shows loading state', () => {
    const mockClient = createMockClient()
    provideApolloClient(mockClient)
    
    const wrapper = mount(UserList)
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
  })

  it('renders user list', async () => {
    const mockClient = createMockClient()
    
    mockClient.setRequestHandler(GET_USERS, () => Promise.resolve({
      data: {
        users: {
          data: [
            { id: '1', name: 'User 1', email: 'user1@example.com' },
            { id: '2', name: 'User 2', email: 'user2@example.com' },
          ],
        },
      },
    }))
    
    provideApolloClient(mockClient)
    
    const wrapper = mount(UserList)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.findAll('[data-testid="user-item"]')).toHaveLength(2)
  })

  it('shows error message on failure', async () => {
    const mockClient = createMockClient()
    
    mockClient.setRequestHandler(GET_USERS, () => 
      Promise.reject(new Error('Failed to fetch users'))
    )
    
    provideApolloClient(mockClient)
    
    const wrapper = mount(UserList)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Failed to fetch users')
  })
})
```

---

## 🎭 E2E Testing

### Setup Playwright

```powershell
npm install -D @playwright/test @nuxtjs/playwright
```

**playwright.config.ts:**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Examples

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('successful login', async ({ page }) => {
    await page.goto('/login')
    
    // Fill login form
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    
    // Submit form
    await page.click('[data-testid="login-button"]')
    
    // Wait for navigation
    await page.waitForURL('/dashboard')
    
    // Verify logged in
    expect(page.url()).toContain('/dashboard')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email"]', 'wrong@example.com')
    await page.fill('[data-testid="password"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')
    
    // Verify error message
    await expect(page.locator('.error-message')).toContainText('Invalid credentials')
  })

  test('validates email format', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email"]', 'invalid-email')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await expect(page.locator('.error-message')).toContainText('Email tidak valid')
  })
})
```

```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/dashboard')
  })

  test('navigates to kontrak page', async ({ page }) => {
    await page.click('text=Kontrak')
    await page.waitForURL('/kontrak')
    
    expect(page.url()).toContain('/kontrak')
    await expect(page.locator('h1')).toContainText('Kontrak')
  })

  test('navigates to user management', async ({ page }) => {
    await page.click('text=User Management')
    await page.waitForURL('/user')
    
    expect(page.url()).toContain('/user')
  })

  test('mobile menu works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
  })
})
```

---

## 🎯 Code Quality

### ESLint Configuration

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  extends: [
    '@antfu/eslint-config-vue',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Vue
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    
    // General
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
}
```

### Stylelint Configuration

```javascript
// .stylelintrc.cjs
module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    '@stylistic/stylelint-config',
  ],
  rules: {
    'selector-class-pattern': null,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'layer'],
      },
    ],
  },
}
```

### Pre-commit Hooks

```powershell
npm install -D husky lint-staged
npx husky init
```

**package.json:**
```json
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "git add"
    ],
    "*.{css,scss,vue}": [
      "stylelint --fix",
      "git add"
    ]
  }
}
```

**.husky/pre-commit:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

---

## 📚 Best Practices

### 1. Component Design

```vue
<!-- ✅ Good: Clear props, proper typing -->
<script setup lang="ts">
interface Props {
  title: string
  description?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  loading: false,
})

interface Emits {
  click: []
  submit: [data: FormData]
}

const emit = defineEmits<Emits>()
</script>
```

### 2. Composition Over Inheritance

```typescript
// ✅ Good: Use composables
export function useProductList() {
  const products = ref([])
  const loading = ref(false)
  
  async function fetchProducts() {
    loading.value = true
    try {
      products.value = await $fetch('/api/products')
    } finally {
      loading.value = false
    }
  }
  
  return { products, loading, fetchProducts }
}
```

### 3. Error Handling

```typescript
// ✅ Good: Comprehensive error handling
try {
  await createProduct(data)
  
  useSnackbar().show({
    message: 'Produk berhasil dibuat',
    color: 'success',
  })
  
  navigateTo('/products')
} catch (error) {
  console.error('Create product error:', error)
  
  const message = error?.message || 'Terjadi kesalahan'
  
  useSnackbar().show({
    message,
    color: 'error',
  })
}
```

### 4. Reactive Data

```typescript
// ✅ Good: Proper reactivity
const user = ref({ name: 'John', age: 30 })

function updateUser() {
  user.value = { ...user.value, age: 31 }
}

// ❌ Bad: Mutating without reassignment
function updateUserBad() {
  user.value.age = 31 // Works but less predictable
}
```

### 5. Computed Properties

```typescript
// ✅ Good: Pure computed
const fullName = computed(() => 
  `${user.value.firstName} ${user.value.lastName}`
)

// ❌ Bad: Side effects in computed
const badComputed = computed(() => {
  fetchSomething() // Don't do this!
  return someValue
})
```

---

## 🔄 Common Patterns

### Loading State Pattern

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = await useAsyncData(
  'users',
  () => $fetch('/api/users')
)
</script>

<template>
  <div>
    <VProgressLinear v-if="pending" indeterminate />
    
    <VAlert v-else-if="error" type="error">
      {{ error.message }}
    </VAlert>
    
    <template v-else>
      <!-- Render data -->
    </template>
  </div>
</template>
```

### Confirmation Dialog Pattern

```vue
<script setup lang="ts">
async function handleDelete(id: string) {
  const confirmed = await useConfirmDialog().confirm({
    title: 'Hapus Item',
    message: 'Apakah Anda yakin?',
  })
  
  if (!confirmed) return
  
  try {
    await $fetch(`/api/items/${id}`, { method: 'DELETE' })
    useSnackbar().show({ message: 'Berhasil dihapus', color: 'success' })
  } catch (error) {
    useSnackbar().show({ message: 'Gagal menghapus', color: 'error' })
  }
}
</script>
```

### Search & Filter Pattern

```vue
<script setup lang="ts">
const search = ref('')
const filters = ref({
  category: '',
  status: 'all',
})

const { data, refresh } = await useAsyncData(
  'products',
  () => $fetch('/api/products', {
    query: {
      search: search.value,
      ...filters.value,
    },
  }),
  {
    watch: [search, filters],
  }
)
</script>
```

---

## ⚡ Performance Tips

### 1. Lazy Load Components

```vue
<script setup lang="ts">
const HeavyChart = defineAsyncComponent(() =>
  import('@/components/charts/HeavyChart.vue')
)
</script>
```

### 2. Virtual Scrolling for Large Lists

```vue
<template>
  <RecycleScroller
    :items="items"
    :item-size="50"
  >
    <template #default="{ item }">
      <div>{{ item.name }}</div>
    </template>
  </RecycleScroller>
</template>
```

### 3. Debounce User Input

```typescript
const search = ref('')
const debouncedSearch = refDebounced(search, 300)

watch(debouncedSearch, (value) => {
  performSearch(value)
})
```

### 4. Memoize Expensive Computations

```typescript
const expensiveResult = computed(() => {
  // Expensive calculation
  return heavyComputation(data.value)
})
```

---

**Last Updated:** October 2025
