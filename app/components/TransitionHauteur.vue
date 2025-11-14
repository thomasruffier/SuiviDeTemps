<template>
  <ClientOnly>
    <transition
      enter-active-class="enter-active"
      leave-active-class="leave-active"
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
      @after-leave="afterLeave">
      <slot />
    </transition>
  </ClientOnly>
</template>

<script setup>
const props = defineProps({
  duree: {
    type: Number,
    default: 0.5,
  },
});
const emit = defineEmits(["height"]);

/**
 * @param {HTMLElement} element
 */
const beforeEnter = (element) => {
  if (process.client) {
    // S'assurer que l'élément est visible pour calculer correctement sa hauteur
    element.style.display = "";
    element.style.height = "0px";
    element.style.overflow = "hidden";
  }
};

/**
 * @param {HTMLElement} element
 */
const enter = (element) => {
  if (process.client) {
    requestAnimationFrame(() => {
      // Calculer la hauteur finale en s'assurant que l'élément est dans son état final
      const finalHeight = element.scrollHeight;
      element.style.height = `${finalHeight}px`;
      emit("height", finalHeight);
    });
  }
};

/**
 * @param {HTMLElement} element
 */
const afterEnter = (element) => {
  // Garder la hauteur fixe pour éviter les sauts
  element.style.overflow = "";
};

/**
 * @param {HTMLElement} element
 */
const beforeLeave = (element) => {
  if (process.client) {
    requestAnimationFrame(() => {
      element.style.height = `${element.offsetHeight}px`;
      element.style.overflow = "hidden";
    });
  }
};

/**
 * @param {HTMLElement} element
 */
const leave = (element) => {
  if (process.client) {
    requestAnimationFrame(() => {
      element.style.height = "0px";
    });
  }
};

/**
 * @param {HTMLElement} element
 */
const afterLeave = (element) => {
  element.style.height = "";
  element.style.overflow = "";
};
</script>

<style scoped>
.enter-active,
.leave-active {
  overflow: hidden;
  transition: height ease-in-out calc(v-bind(duree) * 1s);
}
</style>
