# Senior Vue.js / Nuxt.js Tech Lead Guide

## How to Build a Fullstack Project: Production-Grade, Industry Standard

> This guide is written for LLM consumption and developer reference. It covers how a technical lead _thinks_, _decides_, and _executes_ when building a Vue/Nuxt fullstack project from scratch. Every section reflects real industry standards used in production teams.

---

## Table of Contents

1. How a Tech Lead Thinks Before Writing Code
2. System Design and Architecture Decisions
3. How They Divide the System
4. Project Scaffolding and Toolchain Setup
5. Design System and Style Dictionary
6. Feature-Based Architecture Deep Dive
7. Data Layer: API Design and State Management
8. Authentication and Security
9. Performance Strategy
10. Testing Strategy
11. Developer Experience and Tooling
12. The Workflow: Day-to-Day and Sprint-Level
13. Deployment and Infrastructure
14. Code Review Standards
15. Common Mistakes and How Seniors Avoid Them

---

## 1. How a Tech Lead Thinks Before Writing Code

A tech lead does not open a code editor first. They open a document or whiteboard.

Their first questions are always business questions, not technical ones:

- What problem does this product solve?
- Who are the users and what are the core user journeys?
- What are the non-negotiable features versus nice-to-haves?
- What is the expected scale — 100 users or 100,000?
- What is the team size and skill level?
- What is the deployment environment and budget?

Only after these questions are answered do they think about architecture.

### Mental Models a Senior Uses

**Separation of concerns.** Every layer of the system has one job. The UI layer renders. The data layer fetches. The business logic layer transforms. The server layer persists. Nothing bleeds into something else.

**Optimize for change, not for cleverness.** Code will be changed more than it is written. A senior designs for the developer who will maintain this in 6 months — often themselves.

**Boring technology is good technology.** Seniors resist new tools unless there is a clear, justified reason. A stable, well-understood stack with good documentation is worth more than a novel one.

**Fail fast, fail loudly.** Production bugs should be caught in development. This means TypeScript, Zod, linting, and tests — not optional add-ons but part of the foundation.

---

## 2. System Design and Architecture Decisions

Before touching Nuxt, a tech lead maps out the full system on paper or in a diagram tool like Excalidraw or Miro.

### The Layers of a Nuxt Fullstack Application

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  Vue Components → Pinia Stores → Composables            │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / fetch
┌────────────────────────▼────────────────────────────────┐
│              NUXT SERVER (Nitro)                         │
│  API Routes → Middleware → Server Utils → Auth           │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                   DATA LAYER                             │
│  Drizzle ORM / Prisma → PostgreSQL / SQLite              │
└─────────────────────────────────────────────────────────┘
```

Each layer communicates only with the layer directly adjacent to it. The UI never talks to the database directly. The database never knows anything about the UI.

### Key Architecture Decisions a Tech Lead Makes Upfront

**Rendering strategy.** Nuxt supports SSR (server-side rendering), SSG (static site generation), SPA (single page application), and hybrid rendering where different routes use different strategies. A tech lead decides this per route, not per application. A marketing landing page is SSG. A dashboard is CSR. A product listing page with SEO requirements is SSR.

**Authentication strategy.** Cookie-based sessions (nuxt-auth-utils) versus JWT tokens. Sessions are simpler and more secure for most applications. JWTs are used when stateless auth across multiple services is required.

**Database choice.** PostgreSQL for production. SQLite for local development with the same ORM. Drizzle ORM is preferred over Prisma in modern teams for its type-safety, performance, and zero-overhead abstraction.

**Monorepo vs single repo.** For a fullstack Nuxt app, a single repository is almost always the right answer. The server and client are co-located in the same Nuxt project. Monorepos (Turborepo) are for multiple applications sharing packages.

---

## 3. How They Divide the System

### The Feature-Based Architecture

A senior organizes code by business domain, not by file type. This is the single most important structural decision.

```
/features/
  /auth/
  /dashboard/
  /products/
  /checkout/
  /notifications/
  /settings/
```

Each feature is a self-contained vertical slice of the application. It owns its own components, composables, stores, types, schemas, and API layer.

### Full Feature Anatomy

```
/features/
  /products/
  ├── components/
  │   ├── ProductCard.vue          ← presentational, receives props
  │   ├── ProductList.vue          ← orchestrates ProductCard
  │   ├── ProductDetail.vue        ← full product page component
  │   ├── ProductForm.vue          ← create/edit form
  │   └── ProductSkeleton.vue      ← loading state skeleton
  │
  ├── composables/
  │   ├── useProducts.ts           ← list fetching, filtering, pagination
  │   ├── useProduct.ts            ← single product fetching
  │   └── useProductMutations.ts   ← create, update, delete logic
  │
  ├── stores/
  │   └── products.store.ts        ← Pinia store for products state
  │
  ├── types/
  │   └── product.types.ts         ← Product, ProductVariant, ProductStatus
  │
  ├── schemas/
  │   └── product.schema.ts        ← Zod schemas for validation
  │
  ├── api/
  │   └── products.api.ts          ← all $fetch calls, typed
  │
  └── index.ts                     ← barrel export, public API of this feature
```

### The Barrel Export Pattern

Every feature exposes a deliberate public API through its `index.ts`. Anything not exported is considered private to that feature.

```typescript
// features/products/index.ts
export { default as ProductCard } from "./components/ProductCard.vue";
export { default as ProductList } from "./components/ProductList.vue";
export { default as ProductDetail } from "./components/ProductDetail.vue";
export { useProducts } from "./composables/useProducts";
export { useProduct } from "./composables/useProduct";
export { useProductsStore } from "./stores/products.store";
export type { Product, ProductVariant } from "./types/product.types";
export {
  CreateProductSchema,
  UpdateProductSchema,
} from "./schemas/product.schema";
```

Consuming this feature from anywhere in the app:

```typescript
import { ProductList, useProducts, type Product } from "~/features/products";
```

### The Three-Tier Component Model

Seniors think about components in three tiers and never mix them.

**Tier 1 — Base Components.** In `/components/base/`. Purely presentational. No business logic. No API calls. No store access. They receive props, emit events.

```
BaseButton.vue
BaseInput.vue
BaseModal.vue
BaseAvatar.vue
BaseBadge.vue
BaseCard.vue
BaseTooltip.vue
```

**Tier 2 — Feature Components.** Inside each feature folder. They contain business logic. They use composables. They access stores. They are domain-aware.

```
features/products/components/ProductCard.vue
features/checkout/components/CheckoutSummary.vue
```

**Tier 3 — Page Components.** In `/pages/`. Thin orchestrators only. They compose feature components and set page-level metadata.

```vue
<!-- pages/products/[id].vue — senior style -->
<script setup>
import { ProductDetail } from "~/features/products";

definePageMeta({ layout: "dashboard" });
useHead({ title: "Product Detail" });
</script>

<template>
  <ProductDetail />
</template>
```

### The Shared Layer

Code that belongs to no single feature lives in `/shared/`.

```
/shared/
  /composables/
    useDebounce.ts
    useIntersectionObserver.ts
    useClipboard.ts
    useMediaQuery.ts
    useLocalStorage.ts
  /utils/
    formatDate.ts
    formatCurrency.ts
    cn.ts                  ← class merging utility
    slugify.ts
  /types/
    api.types.ts           ← ApiResponse<T>, PaginatedResponse<T>
    error.types.ts         ← AppError, ValidationError
    common.types.ts        ← ID, Timestamp, SortOrder
```

### Server Structure Mirrors Feature Structure

```
/server/
  /api/
    /auth/
      login.post.ts
      logout.post.ts
      me.get.ts
    /products/
      index.get.ts         ← list products
      index.post.ts        ← create product
      [id].get.ts          ← get one product
      [id].put.ts          ← update product
      [id].delete.ts       ← delete product
    /checkout/
      index.post.ts
      [id]/confirm.post.ts
  /middleware/
    auth.ts                ← protect routes
    rate-limit.ts
  /utils/
    db.ts                  ← database connection singleton
    auth.ts                ← session helpers
    errors.ts              ← createAppError factory
```

---

## 4. Project Scaffolding and Toolchain Setup

### Initial Setup Commands

```bash
npx nuxi@latest init my-app
cd my-app
npm install
```

### Core Dependencies a Senior Installs Immediately

```bash
# State management
npm install pinia @pinia/nuxt pinia-plugin-persistedstate

# Validation
npm install zod

# Database ORM
npm install drizzle-orm drizzle-kit
npm install better-sqlite3          # local development
# npm install postgres               # production PostgreSQL

# Authentication
npm install nuxt-auth-utils

# Styling
npm install -D sass

# Style Dictionary (design tokens)
npm install -D style-dictionary

# Component development
npm install -D histoire @histoire/plugin-vue

# Testing
npm install -D vitest @vitest/coverage-v8
npm install -D @vue/test-utils happy-dom
npm install -D playwright @playwright/test

# Code quality
npm install -D eslint @nuxt/eslint
npm install -D prettier eslint-config-prettier
npm install -D husky lint-staged
```

### `nuxt.config.ts` Senior Setup

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@pinia/nuxt", "nuxt-auth-utils", "@nuxt/eslint", "@nuxt/image"],

  typescript: {
    strict: true, // non-negotiable
    typeCheck: true,
  },

  css: ["~/assets/styles/main.scss"],

  runtimeConfig: {
    // Server-only secrets (never exposed to client)
    databaseUrl: process.env.DATABASE_URL,
    authSecret: process.env.AUTH_SECRET,

    // Public (exposed to client)
    public: {
      appUrl: process.env.APP_URL,
    },
  },

  nitro: {
    experimental: {
      tasks: true, // scheduled tasks
    },
  },

  // Route-level rendering strategy
  routeRules: {
    "/": { prerender: true }, // marketing pages: SSG
    "/app/**": { ssr: false }, // app dashboard: SPA/CSR
    "/blog/**": { isr: 3600 }, // blog: ISR with 1hr revalidation
  },
});
```

---

## 5. Design System and Style Dictionary

This is the first thing a senior builds before any feature. The entire visual language of the application lives here.

### Style Dictionary Structure

```
/assets/
  /tokens/
    /base/
      color.json           ← raw color values
      typography.json      ← font families, sizes, weights
      spacing.json         ← spacing scale
      radius.json          ← border radius scale
      shadow.json          ← box shadow definitions
    /semantic/
      color.json           ← semantic aliases (surface, on-surface, etc.)
      component.json       ← component-level tokens
  /styles/
    _reset.scss
    _typography.scss
    main.scss
```

### Token Example: Two-Layer Token System

```json
// assets/tokens/base/color.json — raw palette
{
  "color": {
    "indigo": {
      "50": { "value": "#eef2ff" },
      "100": { "value": "#e0e7ff" },
      "500": { "value": "#6366f1" },
      "600": { "value": "#4f46e5" },
      "900": { "value": "#312e81" }
    },
    "slate": {
      "50": { "value": "#f8fafc" },
      "900": { "value": "#0f172a" }
    }
  }
}
```

```json
// assets/tokens/semantic/color.json — semantic aliases
{
  "color": {
    "brand": {
      "primary": { "value": "{color.indigo.500}" },
      "primary-hover": { "value": "{color.indigo.600}" }
    },
    "surface": {
      "default": { "value": "{color.slate.50}" },
      "elevated": { "value": "#ffffff" }
    },
    "text": {
      "primary": { "value": "{color.slate.900}" },
      "secondary": { "value": "#64748b" },
      "disabled": { "value": "#94a3b8" }
    }
  }
}
```

### Style Dictionary Config

```javascript
// style-dictionary.config.js
export default {
  source: ["assets/tokens/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      prefix: "app",
      buildPath: "assets/styles/generated/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: { outputReferences: true },
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: "shared/tokens/",
      files: [
        {
          destination: "tokens.ts",
          format: "javascript/es6",
        },
      ],
    },
  },
};
```

Running `npx style-dictionary build` generates:

```css
/* assets/styles/generated/tokens.css */
:root {
  --app-color-brand-primary: #6366f1;
  --app-color-brand-primary-hover: #4f46e5;
  --app-color-surface-default: #f8fafc;
  --app-color-text-primary: #0f172a;
  --app-color-text-secondary: #64748b;
}
```

Components then use `var(--app-color-brand-primary)` exclusively. No raw hex values anywhere in component styles.

### Base Component Example Using Tokens

```vue
<!-- components/base/BaseButton.vue -->
<script setup lang="ts">
interface Props {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  loading: false,
  disabled: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <button
    :class="[
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--loading': loading },
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped lang="scss">
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: var(--app-radius-md);
  font-weight: 500;
  transition:
    background-color 150ms ease,
    opacity 150ms ease;
  cursor: pointer;
  border: none;

  &--primary {
    background-color: var(--app-color-brand-primary);
    color: #fff;
    &:hover:not(:disabled) {
      background-color: var(--app-color-brand-primary-hover);
    }
  }

  &--sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
  &--md {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
  &--lg {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
```

---

## 6. Feature-Based Architecture Deep Dive

### Complete Auth Feature Example

```typescript
// features/auth/types/auth.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member" | "viewer";
  avatarUrl: string | null;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  expiresAt: string;
}
```

```typescript
// features/auth/schemas/auth.schema.ts
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const RegisterSchema = LoginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
```

```typescript
// features/auth/api/auth.api.ts
import type { User, LoginPayload } from "../types/auth.types";

export const authApi = {
  login: (payload: LoginPayload) =>
    $fetch<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: payload,
    }),

  logout: () => $fetch("/api/auth/logout", { method: "POST" }),

  getMe: () => $fetch<User>("/api/auth/me"),
};
```

```typescript
// features/auth/stores/auth.store.ts
import { defineStore } from "pinia";
import { authApi } from "../api/auth.api";
import type { User, LoginPayload } from "../types/auth.types";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  async function login(payload: LoginPayload) {
    isLoading.value = true;
    try {
      const { user: userData } = await authApi.login(payload);
      user.value = userData;
      await navigateTo("/app/dashboard");
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    await authApi.logout();
    user.value = null;
    await navigateTo("/login");
  }

  async function fetchCurrentUser() {
    try {
      user.value = await authApi.getMe();
    } catch {
      user.value = null;
    }
  }

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    isAuthenticated,
    isAdmin,
    login,
    logout,
    fetchCurrentUser,
  };
});
```

```typescript
// features/auth/composables/useAuth.ts
export function useAuth() {
  const store = useAuthStore();
  const { user, isAuthenticated, isAdmin, isLoading } = storeToRefs(store);

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login: store.login,
    logout: store.logout,
  };
}
```

---

## 7. Data Layer: API Design and State Management

### Server Route Pattern

```typescript
// server/api/products/index.get.ts
import { z } from "zod";
import { db } from "~/server/utils/db";
import { products } from "~/server/db/schema";

const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  // 1. Authenticate
  const session = await requireUserSession(event);

  // 2. Validate query params
  const query = await getValidatedQuery(event, QuerySchema.parse);

  // 3. Business logic
  const offset = (query.page - 1) * query.limit;

  const results = await db.query.products.findMany({
    where: query.search
      ? (p, { ilike }) => ilike(p.name, `%${query.search}%`)
      : undefined,
    limit: query.limit,
    offset,
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });

  // 4. Return typed response
  return {
    data: results,
    meta: {
      page: query.page,
      limit: query.limit,
      total: results.length,
    },
  };
});
```

### Shared API Response Type

```typescript
// shared/types/api.types.ts
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
```

### Composable Data Fetching Pattern

```typescript
// features/products/composables/useProducts.ts
import type { Product } from "../types/product.types";
import type { ApiResponse } from "~/shared/types/api.types";

export function useProducts() {
  const page = ref(1);
  const search = ref("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, status, refresh } = useLazyFetch<ApiResponse<Product[]>>(
    "/api/products",
    {
      query: computed(() => ({
        page: page.value,
        search: debouncedSearch.value || undefined,
      })),
      watch: [page, debouncedSearch],
    },
  );

  const products = computed(() => data.value?.data ?? []);
  const isLoading = computed(() => status.value === "pending");

  function nextPage() {
    page.value++;
  }
  function prevPage() {
    if (page.value > 1) page.value--;
  }

  return {
    products,
    isLoading,
    page: readonly(page),
    search,
    nextPage,
    prevPage,
    refresh,
  };
}
```

---

## 8. Authentication and Security

### Server Middleware for Protected Routes

```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  const protectedPaths = ["/api/products", "/api/checkout", "/api/users"];
  const path = getRequestURL(event).pathname;

  if (protectedPaths.some((p) => path.startsWith(p))) {
    await requireUserSession(event);
  }
});
```

### Client Middleware for Protected Pages

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated.value) {
    return navigateTo("/login");
  }
});
```

```typescript
// middleware/guest.ts — redirect authenticated users away from login page
export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated.value) {
    return navigateTo("/app/dashboard");
  }
});
```

Applied per page:

```vue
<!-- pages/app/dashboard.vue -->
<script setup>
definePageMeta({ middleware: ["auth"] });
</script>
```

---

## 9. Performance Strategy

### Rendering Mode Decision Per Route

```typescript
// nuxt.config.ts
routeRules: {
  '/':              { prerender: true },     // fully static
  '/pricing':       { prerender: true },
  '/blog/**':       { isr: 3600 },           // revalidate every hour
  '/app/**':        { ssr: false },          // pure client-side, behind auth
  '/api/**':        { cors: false },
}
```

### Lazy Loading Heavy Components

```typescript
// Only load when component enters the viewport or is needed
const HeavyChart = defineAsyncComponent({
  loader: () => import("~/features/dashboard/components/RevenueChart.vue"),
  loadingComponent: ChartSkeleton,
  errorComponent: ErrorFallback,
  delay: 200,
  timeout: 10000,
});
```

### Suspense with Async Components Pattern

```vue
<!-- features/dashboard/components/DashboardOverview.vue -->
<script setup lang="ts">
// Async setup — this component is automatically a suspense boundary child
const { data: stats } = await useFetch("/api/dashboard/stats");
const { data: recentOrders } = await useFetch("/api/orders/recent");
</script>

<template>
  <div class="dashboard-overview">
    <StatsGrid :stats="stats" />
    <RecentOrdersTable :orders="recentOrders" />
  </div>
</template>
```

```vue
<!-- pages/app/dashboard.vue -->
<template>
  <Suspense>
    <template #default>
      <DashboardOverview />
    </template>
    <template #fallback>
      <DashboardSkeleton />
    </template>
  </Suspense>
</template>
```

### Vue Performance Directives

```vue
<template>
  <!-- v-memo: only re-render when id or selected changes -->
  <ProductCard
    v-for="product in products"
    :key="product.id"
    v-memo="[product.id, product.selected]"
    :product="product"
  />
</template>
```

```typescript
// Use shallowRef for large data structures that don't need deep reactivity
const largeDataset = shallowRef<Record[]>([]);

// Use computed instead of watchers wherever possible
const expensiveComputed = computed(() => {
  return largeDataset.value.filter((item) => item.active).map(transform);
});
```

### Image Optimization

```vue
<!-- Always use NuxtImg instead of <img> -->
<NuxtImg
  src="/images/hero.jpg"
  width="800"
  height="600"
  format="webp"
  loading="lazy"
  placeholder
  alt="Hero image"
/>
```

### Bundle Analysis

```bash
npx nuxi analyze
# or with NUXT_PUBLIC_ANALYZE=true nuxt build
```

Review the output and look for: duplicate dependencies, large third-party libraries that could be lazy loaded, and server-only code accidentally bundled for the client.

---

## 10. Testing Strategy

### Testing Pyramid

```
              /\
             /  \
            / E2E \          ← few, Playwright
           /--------\
          / Integration\     ← moderate, Vitest + real DB
         /--------------\
        /   Unit Tests    \  ← many, Vitest
       /------------------\
```

### Unit Testing a Composable

```typescript
// features/auth/composables/useAuth.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useAuth } from "./useAuth";

describe("useAuth", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("returns isAuthenticated as false when no user", () => {
    const { isAuthenticated } = useAuth();
    expect(isAuthenticated.value).toBe(false);
  });
});
```

### Component Testing

```typescript
// features/products/components/ProductCard.test.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProductCard from "./ProductCard.vue";

const mockProduct = {
  id: "1",
  name: "Test Product",
  price: 99.99,
  imageUrl: "/test.jpg",
};

describe("ProductCard", () => {
  it("renders product name", () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
    });
    expect(wrapper.text()).toContain("Test Product");
  });

  it("emits add-to-cart when button clicked", async () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
    });
    await wrapper.find('[data-testid="add-to-cart"]').trigger("click");
    expect(wrapper.emitted("add-to-cart")).toBeTruthy();
    expect(wrapper.emitted("add-to-cart")![0]).toEqual([mockProduct]);
  });
});
```

### E2E Testing with Playwright

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can log in with valid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "user@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL("/app/dashboard");
  });

  test("shows error with invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "wrong@example.com");
    await page.fill('[data-testid="password-input"]', "wrongpassword");
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
```

### Vitest Config

```typescript
// vitest.config.ts
import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "happy-dom",
    coverage: {
      reporter: ["text", "html"],
      exclude: ["node_modules/", ".nuxt/", "tests/e2e/"],
      thresholds: {
        lines: 80,
        functions: 80,
      },
    },
  },
});
```

---

## 11. Developer Experience and Tooling

### ESLint Configuration

```javascript
// eslint.config.mjs
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
    "vue/no-unused-vars": "error",
    "vue/define-macros-order": [
      "error",
      {
        order: ["defineOptions", "defineProps", "defineEmits", "defineSlots"],
      },
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports" },
    ],
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
});
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "vueIndentScriptAndStyle": false,
  "printWidth": 100
}
```

### Git Hooks with Husky

```bash
# Setup pre-commit hooks
npx husky init
```

```javascript
// .husky/pre-commit
#!/bin/sh
npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,json,md}": ["prettier --write"]
  }
}
```

### TypeScript Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "~/*": ["./*"],
      "@features/*": ["./features/*"],
      "@shared/*": ["./shared/*"],
      "@base/*": ["./components/base/*"]
    }
  }
}
```

---

## 12. The Workflow: Day-to-Day and Sprint-Level

### Before Starting a New Feature (The Checklist)

A tech lead never just starts coding a feature. They answer these first:

1. What are the user stories / acceptance criteria?
2. What API endpoints are needed? What are the request/response shapes?
3. What database schema changes are needed?
4. Are there any shared components that need updating or creating?
5. What new Zod schemas and TypeScript types are needed?
6. What are the edge cases and error states?
7. How will this be tested?

Only after all of these are answered does a single line of code get written.

### Feature Development Workflow (Bottom-Up)

Seniors build features from the bottom of the stack up.

```
Step 1 — Types and schemas
  Define TypeScript interfaces and Zod schemas.
  This forces clarity on data shapes before any logic.

Step 2 — Database schema
  Write Drizzle schema, create and run the migration.

Step 3 — Server API routes
  Build and test API routes in isolation using a REST client.

Step 4 — API client layer
  Write the typed $fetch wrappers in feature/api/.

Step 5 — Pinia store
  Build the store. Unit test it.

Step 6 — Composables
  Wrap store logic in composables for the component layer.

Step 7 — Base components (if needed)
  Build any new generic, reusable components first.

Step 8 — Feature components
  Build feature-specific components using composables.

Step 9 — Page
  Wire it all together in the page. It should be thin.

Step 10 — Tests
  Unit tests for composables, component tests, E2E for critical paths.

Step 11 — Barrel export
  Update features/[name]/index.ts to export new public APIs.
```

### Git Branching Strategy

```
main          → production, always deployable
staging       → pre-production testing
develop       → integration branch

feature/auth-login
feature/product-listing
fix/checkout-price-calculation
chore/update-dependencies
```

### Commit Message Convention (Conventional Commits)

```
feat(products): add infinite scroll to product list
fix(auth): handle expired session token gracefully
refactor(checkout): extract payment logic into composable
test(products): add unit tests for useProducts composable
chore(deps): update nuxt to 3.13.0
docs(readme): update deployment instructions
```

### Pull Request Standards

Every PR must include:

- A description of what changed and why
- Screenshots or recordings for UI changes
- Unit tests for new logic
- No TypeScript errors (`tsc --noEmit` passes)
- ESLint passes
- Test coverage does not decrease

---

## 13. Deployment and Infrastructure

### Environment Variables Strategy

```bash
# .env.example — committed to git, no real values
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
AUTH_SECRET=replace-with-a-random-secret-minimum-32-chars
APP_URL=http://localhost:3000

# .env.local — never committed, real development values
# .env.production — managed by deployment platform (Vercel, Railway, etc.)
```

### Recommended Deployment Stack

```
Vercel / Netlify   → Nuxt application hosting (edge-ready)
Railway / Supabase → PostgreSQL database
Cloudflare R2      → File and image storage
Resend             → Transactional email
Upstash Redis      → Rate limiting, caching, sessions (optional)
```

### Database Migrations with Drizzle

```typescript
// server/db/schema.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "member", "viewer"] })
    .notNull()
    .default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate
```

---

## 14. Code Review Standards

### What a Senior Looks for in a PR

**Correctness.**
Does the code do what it claims? Are edge cases handled? Are error states accounted for?

**Type safety.**
Is `any` used anywhere? Are all function arguments and return values typed? Are API responses typed?

**Security.**
Is user input validated with Zod before it touches the database? Are server routes authenticated where needed? Is no secret exposed to the client bundle?

**Performance.**
Are there unnecessary re-renders? Are large components lazy-loaded? Is `useFetch` used correctly on the server vs client?

**Consistency.**
Does the code follow the established architecture? Is business logic in composables, not in templates? Are pages thin?

**Test coverage.**
Is new logic covered by tests? Are the tests testing behavior, not implementation details?

### Feedback Language Standards

Seniors give feedback constructively. They distinguish between:

- **Must fix** — This will cause a bug or violates a security rule.
- **Should fix** — This violates our architecture conventions.
- **Consider** — This is a suggestion, up to the author's judgment.
- **Nit** — Minor style preference, non-blocking.

---

## 15. Common Mistakes and How Seniors Avoid Them

### Using `$fetch` Directly in Components

```vue
<!-- ❌ Junior: API logic in the component -->
<script setup>
const products = ref([]);
onMounted(async () => {
  products.value = await $fetch("/api/products");
});
</script>

<!-- ✅ Senior: API logic in composable -->
<script setup>
import { useProducts } from "~/features/products";
const { products } = useProducts();
</script>
```

### Mutating Store State Directly Outside the Store

```typescript
// ❌ Junior: mutating store from outside
const store = useAuthStore();
store.user = null; // direct mutation outside store

// ✅ Senior: all mutations through store actions
await store.logout();
```

### Importing Across Features

```typescript
// ❌ Junior: feature importing directly from another feature
// features/checkout/composables/useCheckout.ts
import { useProductsStore } from "~/features/products/stores/products.store";

// ✅ Senior: communicate through shared stores or events
import { useCartStore } from "~/stores/cart.store"; // shared, not feature-owned
```

### Using `watch` Instead of `computed`

```typescript
// ❌ Junior: using watch to derive state
const fullName = ref("");
watch([firstName, lastName], () => {
  fullName.value = `${firstName.value} ${lastName.value}`;
});

// ✅ Senior: use computed for derived state
const fullName = computed(() => `${firstName.value} ${lastName.value}`);
```

### No Error Handling in Server Routes

```typescript
// ❌ Junior: unhandled errors
export default defineEventHandler(async (event) => {
  const data = await db.query.products.findMany();
  return data;
});

// ✅ Senior: explicit error handling with typed errors
export default defineEventHandler(async (event) => {
  try {
    const data = await db.query.products.findMany();
    return data;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch products",
    });
  }
});
```

### Skipping the Loading and Error States

```vue
<!-- ❌ Junior: only happy path -->
<template>
  <ProductList :products="products" />
</template>

<!-- ✅ Senior: all three states handled -->
<template>
  <div v-if="isLoading">
    <ProductListSkeleton />
  </div>
  <div v-else-if="error">
    <ErrorState :message="error.message" @retry="refresh" />
  </div>
  <div v-else>
    <ProductList :products="products" />
    <EmptyState v-if="products.length === 0" />
  </div>
</template>
```

---

## Quick Reference: Senior Decision Framework

| Question                      | Junior Answer            | Senior Answer                                              |
| ----------------------------- | ------------------------ | ---------------------------------------------------------- |
| Where does API logic live?    | In the component         | In a composable inside the feature                         |
| Where does state live?        | In the component         | In a Pinia store                                           |
| How are types shared?         | Copy-pasted              | Defined once in feature/types, exported via barrel         |
| How are pages structured?     | All logic in the page    | Pages are thin, logic in features                          |
| How are design values shared? | Raw hex in components    | CSS variables from Style Dictionary tokens                 |
| How is a new feature started? | Start with the component | Start with types, schema, and API                          |
| When are tests written?       | After, sometimes         | During, always                                             |
| How are errors handled?       | `console.log`            | `createError`, typed error boundaries, toast notifications |
| What is a composable?         | A file with a function   | The primary unit of reusable behavior in Vue               |
| What does a page do?          | Contains all logic       | Composes features, sets metadata                           |

---

_This guide reflects industry practices as of 2025. Stack: Nuxt 3, Vue 3 Composition API, TypeScript strict mode, Pinia, Drizzle ORM, Zod, Style Dictionary, Vitest, Playwright._
