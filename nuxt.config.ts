// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/google-fonts",
    "@nuxt/image",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@nuxt/scripts",
  ],
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      htmlAttrs: {
        lang: "fr",
      },
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
    },
  },
  imports: {
    dirs: ["types"],
  },
  runtimeConfig: {},
  scripts: {},

  googleFonts: {
    families: {
      Lora: true,
      "Libre Franklin": true,
    },
  },
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
      autoprefixer: {},
    },
  },
  ssr: false,
});
