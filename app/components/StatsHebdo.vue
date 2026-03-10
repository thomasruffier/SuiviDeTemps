<template>
  <div class="stats-hebdo">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-sm font-semibold flex items-center gap-2">
        <UIcon name="lucide-bar-chart-3" class="text-primary" />
        Semaine en cours
      </h2>
      <div class="text-xs opacity-50 font-mono tabular-nums">
        Total : {{ formatDuree(totalSemaine) }}
      </div>
    </div>

    <div class="space-y-2">
      <div
        v-for="jour in statsHebdo"
        :key="jour.date"
        class="jour-row"
        :class="{ 'jour-row--today': isToday(jour.date) }">
        <!-- Label du jour -->
        <div
          class="jour-label text-xs font-medium"
          :class="isToday(jour.date) ? 'text-primary' : 'opacity-60'">
          <span
            v-if="isToday(jour.date)"
            class="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1 align-middle">
          </span>
          {{ jour.label }}
        </div>

        <!-- Barre empilée -->
        <div class="jour-bar-track">
          <template v-if="jour.projets.length > 0">
            <div
              v-for="p in jour.projets"
              :key="p.nom"
              class="jour-bar-segment transition-all duration-500"
              :style="{
                width:
                  maxDureeSemaine > 0
                    ? Math.max((p.duree / maxDureeSemaine) * 100, 2) + '%'
                    : '0%',
                backgroundColor: p.couleur,
              }"
              :title="`${p.nom}: ${formatDuree(p.duree)}${p.note ? ' — ' + p.note : ''}`"></div>
          </template>
        </div>

        <!-- Durée totale du jour -->
        <div
          class="text-xs font-mono tabular-nums text-right"
          :class="totalJour(jour) > 0 ? '' : 'opacity-30'">
          {{ formatDuree(totalJour(jour)) }}
        </div>
      </div>
    </div>

    <!-- Légende -->
    <div
      class="flex flex-wrap gap-x-3 gap-y-1 mt-4 pt-3 border-t border-[var(--ui-border)]">
      <div
        v-for="p in projetsAvecDuree"
        :key="p.nom"
        class="flex items-center gap-1.5 text-xs opacity-70">
        <div
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: p.couleur }"></div>
        {{ p.nom }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Projet } from "~/types/Types";

const props = defineProps<{
  projets: Projet[];
}>();

const projetsStore = useProjets();
const statsHebdo = computed(() => projetsStore.getStatsHebdo());

const isToday = (dateStr: string) => dateStr === new Date().toDateString();

const totalJour = (jour: { projets: { duree: number }[] }) =>
  jour.projets.reduce((acc, p) => acc + p.duree, 0);

const totalSemaine = computed(() =>
  statsHebdo.value.reduce((acc, jour) => acc + totalJour(jour), 0),
);

const maxDureeSemaine = computed(() => {
  let max = 0;
  statsHebdo.value.forEach((j) => {
    const t = totalJour(j);
    if (t > max) max = t;
  });
  return max;
});

const projetsAvecDuree = computed(() => {
  const map = new Map<string, { nom: string; couleur: string }>();
  statsHebdo.value.forEach((j) => {
    j.projets.forEach((p) => {
      if (!map.has(p.nom)) {
        map.set(p.nom, { nom: p.nom, couleur: p.couleur });
      }
    });
  });
  return Array.from(map.values());
});

const formatDuree = (value: number) => {
  const heures = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(heures).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};
</script>

<style scoped>
.stats-hebdo {
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
}
.jour-row {
  display: grid;
  grid-template-columns: 5rem 1fr 3.5rem;
  gap: 0.75rem;
  align-items: center;
  padding: 0.375rem 0;
}
.jour-row--today {
  background: rgba(99, 102, 241, 0.04);
  border-radius: 0.5rem;
  padding: 0.375rem 0.5rem;
  margin: 0 -0.5rem;
}
.jour-bar-track {
  display: flex;
  height: 1.125rem;
  border-radius: 0.375rem;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
  gap: 1px;
}
.jour-bar-segment {
  height: 100%;
  border-radius: 0.25rem;
  min-width: 3px;
}
</style>
