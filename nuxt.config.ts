// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-charts',
    'nuxt-vue3-google-signin',
    '@vite-pwa/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },


  runtimeConfig: {
    public: {
      apiUrl: process.env.API_BASE_URL,
    }
  },

  googleSignIn: {
    clientId: process.env.GOOGLE_CLIENT_ID
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: "Sales Commission Digital Business",
      short_name: "Sales Commission",
      description: "Nusanet Digital Business Sales Commission Dashboard",
      lang: 'id',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#00c16a',
      icons: [
        {
          src: '/icons/icon_64x64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: '/icons/icon_144x144.png',
          sizes: '144x144',
          type: 'image/png',
        },
        {
          src: '/icons/icon_192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {

          src: '/icons/icon_384x384.png',
          sizes: '384x384',
          type: 'image/png',
        },
        {
          src: '/icons/icon_512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    }
  }
})