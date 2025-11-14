<template>
  <NuxtPicture
    v-if="props.type == 'picture'"
    :loading="props.loading"
    :class="`contents max-w-none ${props.class2}`"
    :imgAttrs="{
      class: `${props.class}`,
      style: `${props.style}`,
    }"
    :src="src2"
    :alt="props.alt"
    :sizes="props.sizes"
    densities="x1 x2"
    placeholder />
  <img
    v-else-if="props.type == 'classique'"
    :src="src2"
    :alt="props.alt"
    :sizes="props.sizes"
    :class="props.class"
    :style="props.style"
    :width="props.width ?? undefined"
    :height="props.height ?? undefined"
    densities="x1 x2"
    placeholder />
  <NuxtImg
    v-else
    :loading="props.loading"
    :src="src2"
    :alt="props.alt"
    :sizes="
      props.width != undefined || props.height != undefined
        ? undefined
        : props.sizes
    "
    :class="props.class"
    :style="props.style"
    :width="props.width ?? undefined"
    :height="props.height ?? undefined"
    densities="x1 x2"
    placeholder></NuxtImg>
</template>

<script setup lang="ts">
export interface Props {
  class?: string;
  class2?: string;
  src: string | undefined;
  alt: string;
  sizes?: string;
  style?: string;
  loading?: "lazy" | "eager" | undefined;
  type?: "picture" | "image" | "classique";
  width?: number;
  height?: number;
}
const props = withDefaults(defineProps<Props>(), {
  loading: "lazy",
  class: "object-contain object-center w-full h-auto max-w-none",
  sizes: "100vw sm:50vw",
  type: "picture",
});
const src2 = computed(() => {
  if (props.src == undefined) return "";
  return props.src.includes("/public")
    ? props.src.split("/public")[1]
    : props.src;
});
</script>

<style scoped></style>
