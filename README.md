# SIMONEV - Sistem Monitoring dan Evaluasi

[![Nuxt](https://img.shields.io/badge/Nuxt-3.12.2-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.3.13-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vuetify](https://img.shields.io/badge/Vuetify-3.6.10-1867C0?logo=vuetify&logoColor=white)](https://vuetifyjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Aplikasi web modern untuk sistem monitoring dan evaluasi kontrak yang dibangun dengan Nuxt 3, Vuetify, dan GraphQL.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Struktur Proyek](#-struktur-proyek)
- [Dokumentasi](#-dokumentasi)
- [Scripts](#-scripts)
- [Contributing](#-contributing)

## ✨ Fitur Utama

- 🔐 **Authentication & Authorization** - JWT-based dengan CASL untuk permission management
- 📊 **Dashboard Monitoring** - Real-time monitoring dan visualisasi data
- 📝 **Manajemen Kontrak** - CRUD lengkap untuk pengelolaan kontrak
- 👥 **User Management** - Manajemen user dan role-based access control
- 🎨 **Modern UI/UX** - Material Design dengan Vuetify 3
- 🌙 **Dark Mode** - Support tema light dan dark
- 📱 **Responsive** - Mobile-friendly design
- 📈 **Data Visualization** - Charts dengan ApexCharts dan Chart.js
- 🔍 **Advanced Search** - Pencarian dan filter data yang powerful
- 📤 **File Upload** - Upload dan manajemen file/dokumen
- 🌐 **GraphQL API** - Efficient data fetching dengan Apollo Client
- ⚡ **Performance** - Code splitting dan lazy loading
- 🔄 **Real-time Updates** - WebSocket support untuk real-time data

## 🛠️ Teknologi

### Core
- **[Nuxt 3](https://nuxt.com/)** - The Intuitive Vue Framework
- **[Vue 3](https://vuejs.org/)** - Progressive JavaScript Framework
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript with syntax for types
- **[Pinia](https://pinia.vuejs.org/)** - The Vue Store

### UI & Styling
- **[Vuetify 3](https://vuetifyjs.com/)** - Material Design Component Framework
- **[SCSS](https://sass-lang.com/)** - CSS with superpowers
- **[Iconify](https://iconify.design/)** - Universal icon framework

### Data & API
- **[Apollo Client](https://www.apollographql.com/)** - GraphQL client
- **[GraphQL](https://graphql.org/)** - Query language for APIs
- **[VueUse](https://vueuse.org/)** - Collection of Vue Composition Utilities

### Authentication & Security
- **[CASL](https://casl.js.org/)** - Authorization library
- **[JWT](https://jwt.io/)** - JSON Web Tokens
- **[Crypto-js](https://github.com/brix/crypto-js)** - JavaScript library of crypto standards

### Rich Text & Forms
- **[TipTap](https://tiptap.dev/)** - Headless WYSIWYG Text Editor
- **[Vue Flatpickr](https://github.com/ankurk91/vue-flatpickr-component)** - Date picker component

### Visualization
- **[ApexCharts](https://apexcharts.com/)** - Modern charting library
- **[Chart.js](https://www.chartjs.org/)** - Simple yet flexible JavaScript charting
- **[Vue3 Lottie](https://github.com/megasanjay/vue3-lottie)** - Lottie animations for Vue 3

## 📦 Prasyarat

Pastikan sistem Anda sudah terinstall:

- **Node.js** 18.x atau lebih tinggi
- **npm** 9.x atau lebih tinggi (atau yarn/pnpm)
- **Git** untuk version control

### VS Code Extensions (Recommended)

```
Vue Language Features (Volar) - Vue 3 support
TypeScript Vue Plugin (Volar) - TypeScript support for Vue
ESLint - JavaScript linter
Stylelint - CSS/SCSS linter
Prettier - Code formatter
GraphQL - GraphQL syntax highlighting
```

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
- Install semua dependencies
- Generate TypeScript types
- Build icon set

### 3. Setup Environment Variables

Buat file `.env` di root directory:

```powershell
# Copy dari template
Copy-Item .env.example .env
```

Edit `.env` sesuai konfigurasi Anda:

```env
# Application
NUXT_PUBLIC_APP_CODE=SIMONEV
NUXT_APP_BASE_URL=/

# API Configuration
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Auth Configuration
AUTH_SECRET=your-secret-key-here
```

## ⚙️ Konfigurasi

### Environment Variables

| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `NUXT_PUBLIC_APP_CODE` | Kode aplikasi | SIMONEV |
| `NUXT_PUBLIC_API_BASE_URL` | Base URL API GraphQL | http://localhost:3001 |
| `NUXT_APP_BASE_URL` | Base URL aplikasi | / |
| `AUTH_SECRET` | Secret key untuk JWT | - |

### Theme Configuration

Edit `themeConfig.ts` untuk customisasi tema:

```typescript
export const { themeConfig, layoutConfig } = defineThemeConfig({
  app: {
    title: 'simonev',
    contentWidth: ContentWidth.Boxed,
    theme: 'light', // 'light' atau 'dark'
    skin: Skins.Default,
  },
})
```

## 🏃 Menjalankan Aplikasi

### Development Mode

```powershell
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

Features:
- ⚡ Hot Module Replacement (HMR)
- 🔍 Vue DevTools support
- 🛠️ Nuxt DevTools
- 📝 TypeScript checking

### Production Build

```powershell
# Build
npm run build

# Preview
npm run preview
```

### Static Generation

```powershell
npm run generate
```

Output di folder `.output/public/`

## 📁 Struktur Proyek

```
MAGANG-FE/
├── @core/                  # Core framework
│   ├── components/         # Reusable components
│   ├── composable/         # Core composables
│   ├── libs/              # Library integrations
│   └── utils/             # Core utilities
│
├── @layouts/              # Layout system
│   ├── components/        # Layout components
│   └── plugins/           # Layout plugins
│
├── assets/                # Static assets
│   ├── images/           # Images
│   └── styles/           # Global styles
│
├── components/            # App components
│   ├── cards/            # Card components
│   ├── dialogs/          # Dialog components
│   └── forms/            # Form components
│
├── composables/           # Vue composables
│   ├── useApi.ts         # API handling
│   ├── useSnackbar.ts    # Notifications
│   └── graphql/          # GraphQL composables
│
├── graphql/               # GraphQL definitions
│   └── modules/          # GraphQL modules
│
├── layouts/               # Page layouts
│   ├── default.vue       # Default layout
│   └── blank.vue         # Blank layout
│
├── middleware/            # Route middleware
│   └── auth.global.ts    # Auth middleware
│
├── navigation/            # Navigation config
│   ├── horizontal/       # Horizontal menu
│   └── vertical/         # Vertical menu
│
├── pages/                 # Application pages
│   ├── index.vue         # Home page
│   ├── login/            # Login pages
│   ├── kontrak/          # Kontrak module
│   └── pengaturan/       # Settings
│
├── plugins/               # Nuxt plugins
│   ├── vuetify/          # Vuetify config
│   └── iconify/          # Icons setup
│
├── stores/                # Pinia stores
│   └── session.ts        # User session
│
├── types/                 # TypeScript types
├── utils/                 # Utility functions
├── views/                 # View components
│
├── app.vue               # Root component
├── error.vue             # Error page
├── nuxt.config.ts        # Nuxt configuration
├── themeConfig.ts        # Theme configuration
└── package.json          # Dependencies
```

## 📚 Dokumentasi

Dokumentasi lengkap tersedia di folder `docs/`:

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Panduan pengembangan lengkap
- **[docs/API_GRAPHQL.md](./docs/API_GRAPHQL.md)** - GraphQL API documentation
- **[docs/COMPONENTS_STYLING.md](./docs/COMPONENTS_STYLING.md)** - Component & styling guide
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment & environment guide

### Quick Links

- [Membuat Halaman Baru](./DEVELOPMENT.md#membuat-halaman-baru)
- [Membuat Component](./DEVELOPMENT.md#membuat-component)
- [GraphQL Integration](./docs/API_GRAPHQL.md)
- [State Management](./DEVELOPMENT.md#state-management-dengan-pinia)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 📜 Scripts

```powershell
# Development
npm run dev              # Start dev server

# Build
npm run build           # Build for production
npm run generate        # Generate static site

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues

# Icons
npm run build:icons     # Build icon set

# Other
npm run postinstall     # Setup after install
```

## 🔧 Development Workflow

### 1. Create Feature Branch

```powershell
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Ikuti panduan di [DEVELOPMENT.md](./DEVELOPMENT.md)

### 3. Test Your Changes

```powershell
npm run dev
```

### 4. Lint & Fix

```powershell
npm run lint
```

### 5. Commit Changes

```powershell
git add .
git commit -m "feat: your feature description"
```

### 6. Push & Create PR

```powershell
git push origin feature/your-feature-name
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Commit Message Convention

```
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semi colons, etc
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

## 📝 License

[Specify your license here]

## 👥 Team

[Your team information]

## 📞 Support

Untuk pertanyaan dan dukungan:
- Email: [your-email@example.com]
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

**Made with ❤️ using Nuxt 3 and Vuetify**

---

## 🔗 Useful Links

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vuetify 3 Documentation](https://vuetifyjs.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [GraphQL Documentation](https://graphql.org/learn/)

---

**Last Updated:** October 2025
```
