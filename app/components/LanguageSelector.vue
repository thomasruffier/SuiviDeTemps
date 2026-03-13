<template>
  <USelect
    :model-value="locale"
    :items="items"
    @update:model-value="onLocaleChange"
    class="w-[140px]"
    size="sm"
    variant="subtle" />
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();

const flags: Record<string, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  it: "🇮🇹",
  es: "🇪🇸",
  de: "🇩🇪",
  zh: "🇨🇳",
  da: "🇩🇰",
  ar: "🇸🇦",
};

const items = computed(() => {
  return locales.value.map((l: any) => ({
    label: `${flags[l.code] || ""} ${l.name}`,
    value: l.code,
  }));
});

const currentFlag = computed(() => (flags[locale.value as keyof typeof flags]) || "🌐");

function onLocaleChange(val: string | undefined) {
  if (val) setLocale(val);
}
</script>
