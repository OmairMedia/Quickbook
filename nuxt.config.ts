// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@pinia/nuxt", "@nuxt/eslint", "nuxt-auth-utils", "@nuxt/image"],

  typescript: {
    strict: true, // non-negotiable
    typeCheck: "build",
  },
  vite: {
    plugins: [],
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
  },
  css: ["~/assets/styles/main.scss"],

  runtimeConfig: {
    // Server-only secrets (never exposed to client)
    session: {
      password: process.env.NUXT_SESSION_PASSWORD,
      name: "app-session",
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
    },
    jwtSecret: process.env.JWT_SECRET,
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
