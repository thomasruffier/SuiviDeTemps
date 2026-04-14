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
    "@nuxtjs/i18n",
  ],
  i18n: {
    locales: [
      { code: "fr", language: "fr-FR", file: "fr.json", name: "Français" },
      { code: "en", language: "en-US", file: "en.json", name: "English" },
      { code: "it", language: "it-IT", file: "it.json", name: "Italiano" },
      { code: "es", language: "es-ES", file: "es.json", name: "Español" },
      { code: "de", language: "de-DE", file: "de.json", name: "Deutsch" },
      { code: "zh", language: "zh-CN", file: "zh.json", name: "中文" },
      { code: "da", language: "da-DK", file: "da.json", name: "Dansk" },
      { code: "ar", language: "ar-EG", file: "ar.json", name: "العربية", dir: "rtl" },
    ],
    defaultLocale: "fr",
    lazy: true,
    langDir: "../locales",
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      alwaysRedirect: true,
      fallbackLocale: "fr",
    },
  },
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      htmlAttrs: {
        lang: "fr",
      },
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.png" },
        { rel: "apple-touch-icon", href: "/favicon.png" },
      ],
      meta: [{ name: "theme-color", content: "#3f454c" }],
    },
  },
  imports: {
    dirs: ["types"],
  },
  runtimeConfig: {
    public: {
      payloadUrl: process.env.NUXT_PUBLIC_PAYLOAD_URL || 'https://admin.lapierrequimousse.com',
    },
  },
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
