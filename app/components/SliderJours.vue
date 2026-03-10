<template>
  <div
    class="mt-4 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 overflow-hidden">
    <div
      class="px-4 py-3 border-b border-primary/10 flex justify-between items-center">
      <h3 class="text-sm font-semibold opacity-80">
        Historique — {{ projetNom }}
      </h3>
      <span class="text-xs opacity-50"
        >{{ jours.length }} jour{{ jours.length > 1 ? "s" : "" }}</span
      >
    </div>
    <div class="divide-y divide-primary/10 max-h-80 overflow-y-auto">
      <div
        v-for="(jour, index) in joursTries"
        :key="jour.date"
        class="grid grid-cols-[8em_4em_1fr_3em] gap-3 items-center px-4 py-2.5 transition-colors hover:bg-primary/5"
        :class="isToday(jour.date) ? 'bg-primary/10 font-medium' : ''">
        <!-- Date -->
        <div
          class="text-sm"
          :class="isToday(jour.date) ? 'text-primary' : 'opacity-70'">
          <span
            v-if="isToday(jour.date)"
            class="inline-block mr-1 w-1.5 h-1.5 rounded-full bg-primary align-middle"></span>
          {{ formatDate(jour.date) }}
        </div>

        <!-- Durée affichée -->
        <div
          class="text-sm font-mono text-right tabular-nums"
          :class="jour.duree > 0 ? '' : 'opacity-40'">
          {{ formatDuree(jour.duree) }}
        </div>

        <!-- Slider d'édition -->
        <USlider
          :step="30"
          :min="0"
          :max="720"
          :model-value="jour.duree"
          @update:model-value="
            (val: number | undefined) => {
              if (val !== undefined) updateDuree(index, val);
            }
          "
          class="mx-2" />

        <!-- Bouton supprimer -->
        <UButton
          v-if="!isToday(jour.date)"
          icon="lucide-x"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="supprimerJour(index)"
          class="opacity-40 hover:opacity-100 hover:text-red-500 justify-self-center" />
        <div v-else></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Projet, Duree } from "~/types/Types";

const props = defineProps<{
  projet: Projet;
}>();

const emit = defineEmits<{
  (e: "update-duree", date: string, duree: number): void;
  (e: "supprimer-jour", date: string): void;
}>();

const projetNom = computed(() => props.projet.nom);
const jours = computed(() => props.projet.durees);

// Trier par date décroissante (plus récent en haut)
const joursTries = computed(() => {
  return [...jours.value].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
});

const isToday = (dateString: string) => {
  return dateString === new Date().toDateString();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const formatDuree = (duree: number) => {
  const heures = Math.floor(duree / 60);
  const minutes = duree % 60;
  return `${String(heures).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

function updateDuree(sortedIndex: number, newDuree: number) {
  const jour = joursTries.value[sortedIndex];
  if (!jour) return;
  emit("update-duree", jour.date, newDuree);
}

function supprimerJour(sortedIndex: number) {
  const jour = joursTries.value[sortedIndex];
  if (!jour) return;
  emit("supprimer-jour", jour.date);
}
</script>
