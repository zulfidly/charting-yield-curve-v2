// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],
  css: [
    '/assets/style.css',
  ],
  pinia: {
    autoImports: [
      // automatically imports `defineStore`
      'defineStore', // don't have to include import { defineStore } from 'pinia' anymore
      ['defineStore', 'definePiniaStore'], // import { defineStore as definePiniaStore } from 'pinia'
    ],
  },
})

