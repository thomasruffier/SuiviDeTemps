<script setup lang="ts">
import type { Projet } from "~/types/Types";

const props = defineProps<{
  projets: Projet[];
}>();

const { locale, t } = useI18n();
const projetsStore = useProjets();

const mode = ref<"week" | "month">("week");
const pivotDate = ref(new Date());

const stats = computed(() =>
  projetsStore.getStats(pivotDate.value, mode.value, locale.value),
);

const navigate = (delta: number) => {
  const newDate = new Date(pivotDate.value);
  if (mode.value === "week") {
    newDate.setDate(newDate.getDate() + delta * 7);
  } else {
    newDate.setMonth(newDate.getMonth() + delta);
  }
  pivotDate.value = newDate;
};

const isToday = (dateStr: string) => dateStr === new Date().toDateString();

const isTodayInPivot = computed(() => {
  const today = new Date().toDateString();
  return stats.value.some((j) => j.date === today);
});

const dateRangeLabel = computed(() => {
  if (!stats.value || stats.value.length === 0) return "";
  const first = new Date(stats.value[0]?.date || "");
  const last = new Date(stats.value[stats.value.length - 1]?.date || "");

  if (mode.value === "month") {
    return first.toLocaleDateString(locale.value, {
      month: "long",
      year: "numeric",
    });
  }

  return `${first.toLocaleDateString(locale.value, { day: "numeric", month: "short" })} - ${last.toLocaleDateString(locale.value, { day: "numeric", month: "short" })}`;
});

const totalJour = (jour: { projets: { duree: number }[] }) =>
  jour.projets.reduce((acc, p) => acc + p.duree, 0);

const totalPeriode = computed(() =>
  stats.value.reduce((acc, jour) => acc + totalJour(jour), 0),
);

const maxDuree = computed(() => {
  let max = 0;
  stats.value.forEach((j) => {
    const t = totalJour(j);
    if (t > max) max = t;
  });
  return max;
});

const projetsAvecDuree = computed(() => {
  const map = new Map<string, { nom: string; couleur: string }>();
  stats.value.forEach((j) => {
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

<template>
  <div class="stats-hebdo">
    <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
      <div class="flex items-center gap-4">
        <h2 class="flex gap-2 items-center text-sm font-semibold">
          <UIcon name="lucide-bar-chart-3" class="text-primary" />
          {{ mode === "week" ? $t("stats.weekly") : $t("stats.monthly") }}
        </h2>

        <div class="flex p-0.5 border rounded-lg bg-neutral/5 border-neutral/10">
          <button
            @click="mode = 'week'"
            class="px-3 py-1 text-[10px] rounded-md transition-all"
            :class="
              mode === 'week'
                ? 'bg-white shadow-sm font-semibold text-primary'
                : 'opacity-50 hover:opacity-100'
            ">
            {{ $t("stats.week") }}
          </button>
          <button
            @click="mode = 'month'"
            class="px-3 py-1 text-[10px] rounded-md transition-all"
            :class="
              mode === 'month'
                ? 'bg-white shadow-sm font-semibold text-primary'
                : 'opacity-50 hover:opacity-100'
            ">
            {{ $t("stats.month") }}
          </button>
        </div>
      </div>

      <div class="flex justify-between items-center gap-3">
        <div class="text-[10px] opacity-50 font-mono tracking-tight uppercase">
          {{ dateRangeLabel }}
        </div>
        <div class="flex gap-1 items-center">
          <UButton
            icon="lucide-chevron-left"
            size="xs"
            color="neutral"
            variant="subtle"
            @click="navigate(-1)" />
          <UButton
            icon="lucide-rotate-ccw"
            size="xs"
            color="neutral"
            variant="subtle"
            @click="pivotDate = new Date()"
            v-if="!isTodayInPivot"
            :title="$t('project.today')" />
          <UButton
            icon="lucide-chevron-right"
            size="xs"
            color="neutral"
            variant="subtle"
            @click="navigate(1)" />
        </div>
      </div>
    </div>

    <div class="space-y-1.5" :class="{ 'max-h-[400px] overflow-y-auto pr-2': mode === 'month' }">
      <div
        v-for="jour in stats"
        :key="jour.date"
        class="jour-row"
        :class="{ 'jour-row--today': isToday(jour.date) }">
        <!-- Label du jour -->
        <div
          class="text-xs font-medium jour-label"
          :class="isToday(jour.date) ? 'text-primary' : 'opacity-60'">
          <span
            v-if="isToday(jour.date)"
            class="inline-block mr-1 w-1.5 h-1.5 align-middle rounded-full bg-primary">
          </span>
          {{ jour.label }}
        </div>

        <!-- Barre empilée -->
        <div class="jour-bar-track">
          <template v-if="jour.projets.length > 0">
            <div
              v-for="p in jour.projets"
              :key="p.nom"
              class="transition-all duration-500 jour-bar-segment"
              :style="{
                width:
                  maxDuree > 0
                    ? Math.max((p.duree / maxDuree) * 100, 2) + '%'
                    : '0%',
                backgroundColor: p.couleur,
              }"
              :title="`${p.nom}: ${formatDuree(p.duree)}${p.note ? ' — ' + p.note : ''}`"></div>
          </template>
        </div>

        <!-- Durée totale du jour -->
        <div
          class="text-xs text-right font-mono tabular-nums"
          :class="totalJour(jour) > 0 ? '' : 'opacity-30'">
          {{ formatDuree(totalJour(jour)) }}
        </div>
      </div>
    </div>

    <!-- Légende -->
    <div
      class="flex flex-col gap-4 justify-between items-center mt-6 pt-4 border-t border-(--ui-border) sm:flex-row">
      <div class="flex flex-wrap gap-x-3 gap-y-1">
        <div
          v-for="p in projetsAvecDuree"
          :key="p.nom"
          class="flex items-center gap-1.5 text-[10px] opacity-70">
          <div
            class="w-2 h-2 rounded-full"
            :style="{ backgroundColor: p.couleur }"></div>
          {{ p.nom }}
        </div>
      </div>
      <div
        class="text-xs font-bold font-mono tracking-tight tabular-nums text-primary whitespace-nowrap">
        {{ $t("stats.total") }} : {{ formatDuree(totalPeriode) }}
      </div>
    </div>
  </div>
</template>

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
