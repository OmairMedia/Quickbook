// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@pinia/nuxt", "@nuxt/eslint", "nuxt-auth-utils", "@nuxt/image"],

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
