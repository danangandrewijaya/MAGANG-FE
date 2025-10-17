# Panduan Deployment & Environment

## 📋 Daftar Isi
- [Environment Setup](#environment-setup)
- [Build Process](#build-process)
- [Deployment Strategies](#deployment-strategies)
- [Server Deployment](#server-deployment)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Logging](#monitoring--logging)

---

## ⚙️ Environment Setup

### Environment Files

Buat file environment untuk setiap stage:

```
.env                    # Local development (default)
.env.development        # Development server
.env.staging           # Staging server
.env.production        # Production server
```

### Environment Variables

#### `.env.development`
```env
# Application
NUXT_PUBLIC_APP_CODE=SIMONEV
NUXT_APP_BASE_URL=/

# API
NUXT_PUBLIC_API_BASE_URL=http://dev-api.example.com

# Auth
AUTH_SECRET=dev-secret-key-change-this

# Features (optional)
NUXT_PUBLIC_ENABLE_ANALYTICS=false
NUXT_PUBLIC_ENABLE_SENTRY=false
```

#### `.env.staging`
```env
# Application
NUXT_PUBLIC_APP_CODE=SIMONEV
NUXT_APP_BASE_URL=/

# API
NUXT_PUBLIC_API_BASE_URL=https://staging-api.example.com

# Auth
AUTH_SECRET=staging-secret-key-strong-password

# Features
NUXT_PUBLIC_ENABLE_ANALYTICS=true
NUXT_PUBLIC_ENABLE_SENTRY=true
NUXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

#### `.env.production`
```env
# Application
NUXT_PUBLIC_APP_CODE=SIMONEV
NUXT_APP_BASE_URL=/

# API
NUXT_PUBLIC_API_BASE_URL=https://api.example.com

# Auth
AUTH_SECRET=production-very-strong-secret-key

# Features
NUXT_PUBLIC_ENABLE_ANALYTICS=true
NUXT_PUBLIC_ENABLE_SENTRY=true
NUXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Performance
NUXT_PUBLIC_CDN_URL=https://cdn.example.com
```

### Accessing Environment Variables

```typescript
// Runtime config (server & client)
const config = useRuntimeConfig()
console.log(config.public.apiBaseUrl)

// Process env (build time only)
const apiUrl = process.env.NUXT_PUBLIC_API_BASE_URL
```

---

## 🏗️ Build Process

### Development Build

```powershell
# Start development server
npm run dev
```

### Production Build

```powershell
# Clean previous builds
Remove-Item -Recurse -Force .nuxt, .output

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Build with Specific Environment

```powershell
# Build with staging environment
$env:NODE_ENV="production"
npm run build -- --dotenv .env.staging

# Build with production environment
npm run generate -- --dotenv .env.production
```

### Build Optimization

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Optimize build
  vite: {
    build: {
      // Chunk size warning limit
      chunkSizeWarningLimit: 5000,
      
      // Manual chunks
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': [
              'vue',
              'vue-router',
              'pinia',
            ],
            'vuetify': [
              'vuetify',
              'vuetify/components',
            ],
            'charts': [
              'chart.js',
              'vue-chartjs',
              'apexcharts',
              'vue3-apexcharts',
            ],
          },
        },
      },
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'vue',
        'pinia',
        'vuetify',
      ],
    },
  },
  
  // Enable source maps in production (optional)
  sourcemap: {
    server: false,
    client: false,
  },
})
```

---

## 🚀 Deployment Strategies

### Static Hosting (SPA)

Best for: Netlify, Vercel, GitHub Pages, Firebase Hosting

```powershell
# Generate static files
npm run generate

# Output: .output/public/
```

**Deployment Files:**
- HTML, CSS, JS files
- Assets (images, fonts, etc.)
- `_nuxt/` folder with chunks

### Server-Side Rendering (SSR)

Best for: Node.js servers, VPS, Cloud platforms

```powershell
# Build for SSR
npm run build

# Output: .output/
# - .output/server/ (Node.js server)
# - .output/public/ (Static assets)
```

**Running:**
```powershell
node .output/server/index.mjs
```

### Hybrid Rendering

Kombinasi SSR dan Static:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // Static pages
    '/': { prerender: true },
    '/about': { prerender: true },
    
    // SSR pages
    '/dashboard/**': { ssr: true },
    
    // SPA pages
    '/admin/**': { ssr: false },
    
    // ISR (Incremental Static Regeneration)
    '/blog/**': { swr: 3600 }, // Revalidate every hour
  },
})
```

---

## 🖥️ Server Deployment

### 1. Linux VPS (Ubuntu/Debian)

#### Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Reverse Proxy)
sudo apt install -y nginx
```

#### Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone <repository-url> simonev
cd simonev

# Install dependencies
npm ci --production

# Build application
npm run build

# Start with PM2
pm2 start .output/server/index.mjs --name simonev

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup
```

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/simonev
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Static files
    location /_nuxt/ {
        alias /var/www/simonev/.output/public/_nuxt/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/simonev /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Windows Server (IIS)

#### Prerequisites

1. Install Node.js 18+
2. Install IIS (Internet Information Services)
3. Install iisnode module

#### Deploy with iisnode

**web.config:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path=".output/server/index.mjs" verb="*" modules="iisnode"/>
    </handlers>
    
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^.output/server/index.mjs\/debug[\/]?" />
        </rule>
        
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url=".output/server/index.mjs"/>
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --production

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", ".output/server/index.mjs"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  simonev:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: simonev
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NUXT_PUBLIC_API_BASE_URL=${API_URL}
      - AUTH_SECRET=${AUTH_SECRET}
    volumes:
      - ./logs:/app/logs
    networks:
      - app-network
    depends_on:
      - api

  api:
    image: your-api-image:latest
    container_name: simonev-api
    restart: unless-stopped
    ports:
      - "3001:3001"
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: simonev-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    networks:
      - app-network
    depends_on:
      - simonev

networks:
  app-network:
    driver: bridge
```

### Build & Run

```powershell
# Build image
docker build -t simonev:latest .

# Run container
docker run -d `
  --name simonev `
  -p 3000:3000 `
  -e NUXT_PUBLIC_API_BASE_URL=https://api.example.com `
  -e AUTH_SECRET=your-secret `
  simonev:latest

# Or with Docker Compose
docker-compose up -d

# View logs
docker logs -f simonev

# Stop container
docker-compose down
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches:
      - main
      - develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
        env:
          NUXT_PUBLIC_API_BASE_URL: ${{ secrets.API_URL }}
          AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
      
      - name: Deploy to server
        uses: easingthemes/ssh-deploy@v2
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: /var/www/simonev
      
      - name: Restart application
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.REMOTE_HOST }}
          username: ${{ secrets.REMOTE_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/simonev
            pm2 restart simonev
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

variables:
  NODE_VERSION: "18"

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .output/
    expire_in: 1 hour
  only:
    - main
    - develop

test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run lint
    - npm test
  only:
    - main
    - develop

deploy_staging:
  stage: deploy
  script:
    - echo "Deploying to staging..."
    - scp -r .output/* user@staging-server:/var/www/simonev/
    - ssh user@staging-server 'cd /var/www/simonev && pm2 restart simonev'
  only:
    - develop
  environment:
    name: staging
    url: https://staging.example.com

deploy_production:
  stage: deploy
  script:
    - echo "Deploying to production..."
    - scp -r .output/* user@prod-server:/var/www/simonev/
    - ssh user@prod-server 'cd /var/www/simonev && pm2 restart simonev'
  only:
    - main
  when: manual
  environment:
    name: production
    url: https://example.com
```

---

## ⚡ Performance Optimization

### Code Splitting

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('vuetify')) {
                return 'vuetify'
              }
              if (id.includes('chart')) {
                return 'charts'
              }
              return 'vendor'
            }
          },
        },
      },
    },
  },
})
```

### Lazy Loading Components

```vue
<script setup lang="ts">
// Lazy load component
const LazyChart = defineAsyncComponent(() =>
  import('@/components/Chart.vue')
)
</script>

<template>
  <Suspense>
    <template #default>
      <LazyChart />
    </template>
    <template #fallback>
      <VSkeletonLoader type="image" />
    </template>
  </Suspense>
</template>
```

### Image Optimization

```vue
<template>
  <!-- Use Nuxt Image -->
  <NuxtImg
    src="/images/hero.jpg"
    width="800"
    height="600"
    format="webp"
    quality="80"
    loading="lazy"
  />
</template>
```

### Caching Strategy

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // Cache static pages
    '/': { swr: true },
    '/about': { swr: 3600 },
    
    // No cache for dynamic pages
    '/dashboard/**': { swr: false },
    
    // Cache API routes
    '/api/**': { cache: { maxAge: 60 } },
  },
})
```

---

## 📊 Monitoring & Logging

### Sentry Integration

```typescript
// plugins/sentry.client.ts
import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  
  if (config.public.enableSentry) {
    Sentry.init({
      app: nuxtApp.vueApp,
      dsn: config.public.sentryDsn,
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    })
  }
})
```

### Logging

```typescript
// utils/logger.ts
export const logger = {
  info(message: string, data?: any) {
    console.info(`[INFO] ${message}`, data || '')
  },
  
  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error || '')
    
    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error)
    }
  },
  
  warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data || '')
  },
}
```

### Health Check Endpoint

```typescript
// server/api/health.ts
export default defineEventHandler(() => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  }
})
```

---

## 🔐 Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use strong secrets in production
- Rotate secrets regularly

### 2. Dependencies
```powershell
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### 3. Headers Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        },
      },
    },
  },
})
```

---

## 📝 Deployment Checklist

- [ ] Update environment variables
- [ ] Run tests (`npm test`)
- [ ] Check for security vulnerabilities (`npm audit`)
- [ ] Build application (`npm run build`)
- [ ] Test build locally (`npm run preview`)
- [ ] Backup production database
- [ ] Deploy to staging first
- [ ] Test on staging environment
- [ ] Deploy to production
- [ ] Verify deployment
- [ ] Monitor logs and errors
- [ ] Update documentation

---

**Last Updated:** October 2025
