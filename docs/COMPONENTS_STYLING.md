# Panduan Komponen & Styling

## 📋 Daftar Isi
- [Struktur Komponen](#struktur-komponen)
- [Membuat Komponen](#membuat-komponen)
- [Vuetify Components](#vuetify-components)
- [Custom Components](#custom-components)
- [Styling dengan SCSS](#styling-dengan-scss)
- [Theme Customization](#theme-customization)
- [Responsive Design](#responsive-design)
- [Icons](#icons)

---

## 🧩 Struktur Komponen

### Component Hierarchy

```
components/
├── global/                     # Auto-imported globally
│   ├── AppBar.vue
│   └── Footer.vue
├── cards/                      # Card components
│   ├── StatsCard.vue
│   └── InfoCard.vue
├── dialogs/                    # Dialog components
│   ├── ConfirmDialog.vue
│   └── FormDialog.vue
├── forms/                      # Form components
│   ├── UserForm.vue
│   └── LoginForm.vue
└── ...

@core/components/               # Core reusable components
├── AppBarSearch.vue
├── AppStepper.vue
├── CardStatisticsVertical.vue
├── TablePagination.vue
├── ThemeSwitcher.vue
└── ...
```

---

## 🔨 Membuat Komponen

### Basic Component Structure

```vue
<!-- components/ProductCard.vue -->
<script setup lang="ts">
/**
 * Product Card Component
 * Displays product information in a card layout
 */

// Props dengan TypeScript
interface Props {
  id: string
  title: string
  description?: string
  price: number
  image?: string
  inStock?: boolean
}

// Default values
const props = withDefaults(defineProps<Props>(), {
  description: '',
  image: '',
  inStock: true,
})

// Emits
interface Emits {
  click: [id: string]
  addToCart: [id: string]
}

const emit = defineEmits<Emits>()

// Computed
const formattedPrice = computed(() => 
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(props.price)
)

// Methods
function handleClick() {
  emit('click', props.id)
}

function handleAddToCart() {
  emit('addToCart', props.id)
}
</script>

<template>
  <VCard 
    class="product-card"
    :class="{ 'product-card--out-of-stock': !inStock }"
    @click="handleClick"
  >
    <!-- Image -->
    <VImg
      v-if="image"
      :src="image"
      height="200"
      cover
    >
      <VChip
        v-if="!inStock"
        color="error"
        class="product-card__badge"
      >
        Out of Stock
      </VChip>
    </VImg>

    <!-- Content -->
    <VCardTitle>{{ title }}</VCardTitle>

    <VCardText v-if="description">
      {{ description }}
    </VCardText>

    <!-- Footer -->
    <VCardText class="product-card__footer">
      <div class="text-h6 text-primary">
        {{ formattedPrice }}
      </div>
      
      <VBtn
        color="primary"
        :disabled="!inStock"
        @click.stop="handleAddToCart"
      >
        Add to Cart
      </VBtn>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.product-card {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &--out-of-stock {
    opacity: 0.7;
    pointer-events: none;
  }

  &__badge {
    position: absolute;
    top: 12px;
    right: 12px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
}
</style>
```

### Component dengan Slots

```vue
<!-- components/cards/BaseCard.vue -->
<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  loading?: boolean
  elevation?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  loading: false,
  elevation: 2,
})
</script>

<template>
  <VCard :elevation="elevation">
    <!-- Header Slot -->
    <VCardTitle v-if="title || $slots.title">
      <slot name="title">
        {{ title }}
      </slot>
    </VCardTitle>

    <VCardSubtitle v-if="subtitle || $slots.subtitle">
      <slot name="subtitle">
        {{ subtitle }}
      </slot>
    </VCardSubtitle>

    <!-- Actions Slot (Top Right) -->
    <VCardActions v-if="$slots.actions" class="card-actions">
      <slot name="actions" />
    </VCardActions>

    <!-- Loading Overlay -->
    <VProgressLinear
      v-if="loading"
      indeterminate
      color="primary"
    />

    <!-- Main Content -->
    <VCardText>
      <slot />
    </VCardText>

    <!-- Footer Slot -->
    <VCardActions v-if="$slots.footer">
      <slot name="footer" />
    </VCardActions>
  </VCard>
</template>

<style lang="scss" scoped>
.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
```

Penggunaan:

```vue
<template>
  <BaseCard title="User Statistics" :loading="loading">
    <template #actions>
      <VBtn icon="mdi-refresh" size="small" />
    </template>

    <!-- Content -->
    <div>Statistics content here...</div>

    <template #footer>
      <VSpacer />
      <VBtn>View More</VBtn>
    </template>
  </BaseCard>
</template>
```

---

## 🎨 Vuetify Components

### Layout Components

```vue
<template>
  <!-- Container -->
  <VContainer fluid>
    <VRow>
      <!-- Columns -->
      <VCol cols="12" md="6" lg="4">
        <VCard>Content</VCard>
      </VCol>
      
      <VCol cols="12" md="6" lg="8">
        <VCard>Content</VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>
```

### Form Components

```vue
<template>
  <VForm ref="formRef" @submit.prevent="submit">
    <!-- Text Field -->
    <VTextField
      v-model="form.name"
      label="Name"
      :rules="[required]"
      prepend-inner-icon="mdi-account"
    />

    <!-- Text Area -->
    <VTextarea
      v-model="form.description"
      label="Description"
      rows="3"
    />

    <!-- Select -->
    <VSelect
      v-model="form.category"
      :items="categories"
      label="Category"
      item-title="name"
      item-value="id"
    />

    <!-- Autocomplete -->
    <VAutocomplete
      v-model="form.tags"
      :items="availableTags"
      label="Tags"
      multiple
      chips
      closable-chips
    />

    <!-- Checkbox -->
    <VCheckbox
      v-model="form.active"
      label="Active"
    />

    <!-- Switch -->
    <VSwitch
      v-model="form.featured"
      label="Featured"
      color="primary"
    />

    <!-- Radio Group -->
    <VRadioGroup v-model="form.type">
      <VRadio label="Type A" value="a" />
      <VRadio label="Type B" value="b" />
    </VRadioGroup>

    <!-- Date Picker -->
    <VTextField
      v-model="form.date"
      label="Date"
      type="date"
    />

    <!-- File Input -->
    <VFileInput
      v-model="form.files"
      label="Upload Files"
      multiple
      show-size
    />

    <!-- Slider -->
    <VSlider
      v-model="form.priority"
      label="Priority"
      :min="0"
      :max="10"
      step="1"
      thumb-label
    />

    <!-- Range Slider -->
    <VRangeSlider
      v-model="form.priceRange"
      label="Price Range"
      :min="0"
      :max="1000000"
      step="10000"
    />

    <!-- Rating -->
    <VRating
      v-model="form.rating"
      hover
      half-increments
    />

    <!-- OTP Input -->
    <VOtpInput
      v-model="form.otp"
      length="6"
    />

    <VBtn type="submit" color="primary">
      Submit
    </VBtn>
  </VForm>
</template>
```

### Data Display Components

```vue
<template>
  <!-- Data Table -->
  <VDataTable
    :headers="headers"
    :items="items"
    :loading="loading"
    :items-per-page="10"
  >
    <!-- Custom column -->
    <template #item.name="{ item }">
      <div class="d-flex align-center">
        <VAvatar size="32" class="me-2">
          <VImg :src="item.avatar" />
        </VAvatar>
        {{ item.name }}
      </div>
    </template>

    <!-- Actions -->
    <template #item.actions="{ item }">
      <VBtn
        icon="mdi-pencil"
        size="small"
        variant="text"
        @click="edit(item)"
      />
      <VBtn
        icon="mdi-delete"
        size="small"
        variant="text"
        @click="remove(item)"
      />
    </template>
  </VDataTable>

  <!-- List -->
  <VList>
    <VListItem
      v-for="item in items"
      :key="item.id"
      :title="item.title"
      :subtitle="item.subtitle"
      :prepend-avatar="item.avatar"
    >
      <template #append>
        <VBtn icon="mdi-chevron-right" variant="text" />
      </template>
    </VListItem>
  </VList>

  <!-- Chip -->
  <VChip
    color="primary"
    closable
    @click:close="handleClose"
  >
    Tag Name
  </VChip>

  <!-- Badge -->
  <VBadge
    content="3"
    color="error"
  >
    <VIcon icon="mdi-bell" />
  </VBadge>

  <!-- Avatar -->
  <VAvatar color="primary" size="48">
    <VImg v-if="user.avatar" :src="user.avatar" />
    <span v-else>{{ user.initials }}</span>
  </VAvatar>

  <!-- Timeline -->
  <VTimeline side="end" align="start">
    <VTimelineItem
      v-for="event in timeline"
      :key="event.id"
      :dot-color="event.color"
      size="small"
    >
      <template #opposite>
        <div class="text-caption">{{ event.time }}</div>
      </template>
      <div>
        <div class="font-weight-bold">{{ event.title }}</div>
        <div class="text-caption">{{ event.description }}</div>
      </div>
    </VTimelineItem>
  </VTimeline>
</template>
```

### Feedback Components

```vue
<template>
  <!-- Alert -->
  <VAlert
    type="success"
    title="Success!"
    text="Operation completed successfully."
    closable
  />

  <!-- Snackbar -->
  <VSnackbar
    v-model="snackbar"
    :color="snackbarColor"
    :timeout="3000"
  >
    {{ snackbarText }}
    
    <template #actions>
      <VBtn
        variant="text"
        @click="snackbar = false"
      >
        Close
      </VBtn>
    </template>
  </VSnackbar>

  <!-- Dialog -->
  <VDialog v-model="dialog" max-width="500">
    <VCard>
      <VCardTitle>Dialog Title</VCardTitle>
      <VCardText>Dialog content here...</VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn @click="dialog = false">Cancel</VBtn>
        <VBtn color="primary" @click="confirm">Confirm</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- Progress -->
  <VProgressLinear
    :model-value="progress"
    color="primary"
    height="10"
  />

  <VProgressCircular
    :model-value="progress"
    :size="70"
    :width="7"
    color="primary"
  >
    {{ progress }}%
  </VProgressCircular>

  <!-- Skeleton Loader -->
  <VSkeletonLoader
    type="article, actions"
    :loading="loading"
  >
    <!-- Actual content -->
    <VCard>
      <VCardTitle>Title</VCardTitle>
      <VCardText>Content...</VCardText>
    </VCard>
  </VSkeletonLoader>

  <!-- Tooltip -->
  <VTooltip text="Tooltip text" location="top">
    <template #activator="{ props }">
      <VBtn v-bind="props">
        Hover Me
      </VBtn>
    </template>
  </VTooltip>

  <!-- Menu -->
  <VMenu>
    <template #activator="{ props }">
      <VBtn v-bind="props">
        Open Menu
      </VBtn>
    </template>
    <VList>
      <VListItem
        v-for="item in menuItems"
        :key="item.id"
        @click="handleMenuClick(item)"
      >
        {{ item.title }}
      </VListItem>
    </VList>
  </VMenu>
</template>
```

---

## 🎯 Custom Components

### Statistics Card

```vue
<!-- components/cards/StatsCard.vue -->
<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon: string
  color?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
})

const trendIcon = computed(() => 
  props.trend?.isPositive ? 'mdi-trending-up' : 'mdi-trending-down'
)

const trendColor = computed(() =>
  props.trend?.isPositive ? 'success' : 'error'
)
</script>

<template>
  <VCard>
    <VCardText>
      <div class="d-flex align-center justify-space-between">
        <div>
          <div class="text-caption text-medium-emphasis">
            {{ title }}
          </div>
          <div class="text-h4 font-weight-bold mt-2">
            {{ value }}
          </div>
          
          <div
            v-if="trend"
            class="d-flex align-center mt-2"
            :class="`text-${trendColor}`"
          >
            <VIcon :icon="trendIcon" size="20" />
            <span class="text-sm font-weight-medium ms-1">
              {{ Math.abs(trend.value) }}%
            </span>
          </div>
        </div>

        <VAvatar
          :color="color"
          variant="tonal"
          size="56"
        >
          <VIcon :icon="icon" size="32" />
        </VAvatar>
      </div>
    </VCardText>
  </VCard>
</template>
```

### Confirm Dialog

```vue
<!-- components/dialogs/ConfirmDialog.vue -->
<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm',
  message: 'Are you sure?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmColor: 'primary',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

function close() {
  emit('update:modelValue', false)
}

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
  close()
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="400"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle>{{ title }}</VCardTitle>
      
      <VCardText>
        {{ message }}
      </VCardText>
      
      <VCardActions>
        <VSpacer />
        <VBtn
          :disabled="loading"
          @click="handleCancel"
        >
          {{ cancelText }}
        </VBtn>
        <VBtn
          :color="confirmColor"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
```

### Empty State

```vue
<!-- components/EmptyState.vue -->
<script setup lang="ts">
interface Props {
  icon?: string
  title?: string
  description?: string
  actionText?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi-inbox',
  title: 'No data',
  description: 'There is no data to display',
  actionText: '',
})

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="empty-state">
    <VIcon
      :icon="icon"
      size="64"
      color="grey-lighten-1"
    />
    
    <div class="text-h6 mt-4">
      {{ title }}
    </div>
    
    <div class="text-body-2 text-medium-emphasis mt-2">
      {{ description }}
    </div>
    
    <VBtn
      v-if="actionText"
      color="primary"
      class="mt-4"
      @click="emit('action')"
    >
      {{ actionText }}
    </VBtn>
  </div>
</template>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}
</style>
```

---

## 🎨 Styling dengan SCSS

### Variables

```scss
// assets/styles/variables/_custom.scss

// Colors
$primary-color: #6366f1;
$secondary-color: #64748b;
$success-color: #10b981;
$warning-color: #f59e0b;
$error-color: #ef4444;
$info-color: #3b82f6;

// Spacing
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// Border Radius
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-xl: 16px;

// Shadows
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

// Transitions
$transition-fast: 150ms ease;
$transition-base: 300ms ease;
$transition-slow: 500ms ease;
```

### Mixins

```scss
// assets/styles/mixins/_utilities.scss

// Flexbox
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// Truncate text
@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin line-clamp($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Responsive
@mixin responsive($breakpoint) {
  @if $breakpoint == xs {
    @media (max-width: 599px) { @content; }
  } @else if $breakpoint == sm {
    @media (min-width: 600px) and (max-width: 959px) { @content; }
  } @else if $breakpoint == md {
    @media (min-width: 960px) and (max-width: 1279px) { @content; }
  } @else if $breakpoint == lg {
    @media (min-width: 1280px) and (max-width: 1919px) { @content; }
  } @else if $breakpoint == xl {
    @media (min-width: 1920px) { @content; }
  }
}

// Scrollbar
@mixin custom-scrollbar($width: 8px) {
  &::-webkit-scrollbar {
    width: $width;
    height: $width;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: $width;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: $width;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}
```

### Global Styles

```scss
// assets/styles/global.scss
@import 'variables/custom';
@import 'mixins/utilities';

// Typography
.text-truncate {
  @include truncate;
}

.text-clamp-2 {
  @include line-clamp(2);
}

.text-clamp-3 {
  @include line-clamp(3);
}

// Spacing utilities
.gap-xs { gap: $spacing-xs; }
.gap-sm { gap: $spacing-sm; }
.gap-md { gap: $spacing-md; }
.gap-lg { gap: $spacing-lg; }
.gap-xl { gap: $spacing-xl; }

// Custom scrollbar
.custom-scrollbar {
  @include custom-scrollbar;
}

// Card hover effect
.card-hover {
  transition: all $transition-base;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
  }
}

// Loading overlay
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  @include flex-center;
  z-index: 10;
}
```

### Component-specific Styles

```vue
<style lang="scss" scoped>
// Import jika diperlukan
@import '@/assets/styles/variables/custom';
@import '@/assets/styles/mixins/utilities';

.product-card {
  border-radius: $border-radius-lg;
  transition: all $transition-base;

  &:hover {
    box-shadow: $shadow-lg;
  }

  &__image {
    position: relative;
    overflow: hidden;

    img {
      transition: transform $transition-slow;
    }

    &:hover img {
      transform: scale(1.1);
    }
  }

  &__badge {
    position: absolute;
    top: $spacing-md;
    right: $spacing-md;
  }

  &__content {
    padding: $spacing-lg;
  }

  &__title {
    @include truncate;
    font-weight: 600;
    margin-bottom: $spacing-sm;
  }

  &__description {
    @include line-clamp(2);
    color: rgba(0, 0, 0, 0.6);
    font-size: 14px;
  }

  &__footer {
    @include flex-between;
    padding: $spacing-md $spacing-lg;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  // Responsive
  @include responsive(xs) {
    &__content {
      padding: $spacing-md;
    }
  }
}
</style>
```

---

## 🎨 Theme Customization

### Vuetify Theme

```typescript
// plugins/vuetify/theme.ts
export const themes = {
  light: {
    dark: false,
    colors: {
      primary: '#6366f1',
      secondary: '#64748b',
      success: '#10b981',
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444',
      surface: '#ffffff',
      'on-surface': '#0f172a',
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: '#818cf8',
      secondary: '#94a3b8',
      success: '#34d399',
      info: '#60a5fa',
      warning: '#fbbf24',
      error: '#f87171',
      surface: '#1e293b',
      'on-surface': '#f1f5f9',
    },
  },
}
```

### Dynamic Theme Switching

```vue
<script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme()

const isDark = computed({
  get: () => theme.global.name.value === 'dark',
  set: (value) => {
    theme.global.name.value = value ? 'dark' : 'light'
  },
})

function toggleTheme() {
  isDark.value = !isDark.value
}
</script>

<template>
  <VBtn
    :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
    @click="toggleTheme"
  />
</template>
```

---

## 📱 Responsive Design

### Vuetify Breakpoints

```vue
<template>
  <!-- Responsive columns -->
  <VRow>
    <VCol
      cols="12"    <!-- Mobile: full width -->
      sm="6"       <!-- Tablet: half width -->
      md="4"       <!-- Desktop: 1/3 width -->
      lg="3"       <!-- Large: 1/4 width -->
    >
      Content
    </VCol>
  </VRow>

  <!-- Display utilities -->
  <div class="d-none d-sm-block">Visible on tablet and up</div>
  <div class="d-sm-none">Visible only on mobile</div>
</template>
```

### VueUse Breakpoints

```vue
<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { xs, sm, md, lg, xl, mobile, name } = useDisplay()

// xs: < 600px
// sm: 600px - 960px
// md: 960px - 1280px
// lg: 1280px - 1920px
// xl: > 1920px
// mobile: < 960px

const cardCols = computed(() => {
  if (xs.value) return 1
  if (sm.value) return 2
  if (md.value) return 3
  return 4
})
</script>

<template>
  <div>Current breakpoint: {{ name }}</div>
  <div>Columns: {{ cardCols }}</div>
</template>
```

---

## 🎯 Icons

### Iconify Usage

```vue
<template>
  <!-- Material Design Icons -->
  <VIcon icon="mdi-home" />
  <VIcon icon="mdi-account-circle" />
  
  <!-- Boxicons -->
  <VIcon icon="bx-user" />
  <VIcon icon="bxs-star" />
  
  <!-- Font Awesome -->
  <VIcon icon="fa-solid fa-heart" />
  
  <!-- Tabler Icons -->
  <VIcon icon="tabler-brand-github" />

  <!-- With size and color -->
  <VIcon
    icon="mdi-alert-circle"
    size="24"
    color="error"
  />
</template>
```

### Icon Component

```vue
<!-- components/Icon.vue -->
<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  icon: string
  size?: string | number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '24',
  color: 'currentColor',
})
</script>

<template>
  <Icon
    :icon="icon"
    :style="{
      fontSize: typeof size === 'number' ? `${size}px` : size,
      color: color,
    }"
  />
</template>
```

---

**Last Updated:** October 2025
