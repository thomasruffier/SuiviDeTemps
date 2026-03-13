<template>
  <div class="relative p-2 mx-auto lg:p-10 max-w-screen">
    <div class="absolute top-4 right-4 z-50 lg:top-10 lg:right-10">
      <LanguageSelector />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
const { localeProperties } = useI18n();

useHead({
  htmlAttrs: {
    dir: computed(() => localeProperties.value.dir || "ltr"),
    lang: computed(() => localeProperties.value.code),
  },
});
</script>

<style scoped></style>
