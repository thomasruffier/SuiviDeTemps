<template>
  <div
    class="dashboard-resume sticky top-2 backdrop-blur-3xl border border-(--ui-border) bg-white/70 dark:bg-black/50 z-50">
    <!-- Stats rapides -->
    <div class="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
      <!-- Temps travaillé -->
      <div class="stat-card">
        <div class="text-indigo-500 stat-icon bg-indigo-500/15">
          <UIcon name="lucide-clock" class="text-lg" />
        </div>
        <div>
          <div class="text-xs tracking-wide uppercase opacity-60">
            {{ $t("dashboard.worked") }}
          </div>
          <div class="font-mono text-xl font-bold tabular-nums">
            {{ formatDuree(sommeDurees) }}
          </div>
        </div>
      </div>

      <!-- Temps restant -->
      <div class="stat-card">
        <div
          class="stat-icon"
          :class="
            tempsADepenser >= 0
              ? 'bg-emerald-500/15 text-emerald-500'
              : 'bg-red-500/15 text-red-500'
          ">
          <UIcon
            :name="
              tempsADepenser >= 0 ? 'lucide-hourglass' : 'lucide-alert-triangle'
            "
            class="text-lg" />
        </div>
        <div>
          <div class="text-xs tracking-wide uppercase opacity-60">
            {{
              tempsADepenser >= 0
                ? $t("dashboard.remaining")
                : $t("dashboard.overdue")
            }}
          </div>
          <div
            class="font-mono text-xl font-bold tabular-nums"
            :class="tempsADepenser < 0 ? 'text-red-500' : ''">
            {{ formatDuree(Math.abs(tempsADepenser)) }}
          </div>
        </div>
      </div>

      <!-- Fin estimée -->
      <div class="stat-card">
        <div class="stat-icon bg-purple-500/15">
          <UIcon
            :class="tempsADepenser >= 0 ? ' text-purple-500' : ' text-red-500'"
            name="lucide-log-out"
            class="text-lg" />
        </div>
        <div>
          <div class="text-xs tracking-wide uppercase opacity-60">
            {{ $t("dashboard.estimatedEnd") }}
          </div>
          <div
            :class="tempsADepenser < 0 ? 'text-red-500' : ''"
            class="font-mono text-xl font-bold tabular-nums">
            {{
              heureDeFin.toLocaleTimeString($i18n.locale, {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="text-amber-500 stat-icon bg-amber-500/15">
          <UIcon name="lucide-folder-open" class="text-lg" />
        </div>
        <div>
          <div class="text-xs tracking-wide uppercase opacity-60">
            {{ $t("dashboard.activeProjects") }}
          </div>
          <div class="text-xl font-bold">{{ nbProjetsActifs }}</div>
        </div>
      </div>
    </div>

    <!-- Projets actifs -->

    <!-- Barre de progression de la journée -->
    <div class="progress-bar-container">
      <div class="flex justify-between mb-1.5 text-xs opacity-60">
        <span>{{ heureDebut }}</span>
        <span v-if="topProjet">
          {{ $t("dashboard.top") }} :
          <strong class="text-primary">{{ topProjet.nom }}</strong> ({{
            formatDuree(topProjet.duree)
          }})
        </span>
        <span>{{
          heureDeFin.toLocaleTimeString($i18n.locale, {
            hour: "2-digit",
            minute: "2-digit",
          })
        }}</span>
      </div>
      <div class="progress-track">
        <div
          v-for="seg in segments"
          :key="seg.nom"
          class="transition-all duration-500 progress-segment"
          :style="{ width: seg.pourcent + '%', backgroundColor: seg.couleur }"
          :title="`${seg.nom}: ${formatDuree(seg.duree)}`"></div>
        <div
          v-if="pausePourcent > 0"
          class="opacity-40 transition-all duration-500 progress-segment"
          :style="{ width: pausePourcent + '%', backgroundColor: '#9ca3af' }"
          :title="$t('params.lunchBreak')"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Projet } from "~/types/Types";

const { d } = useI18n();

const props = defineProps<{
  projets: Projet[];
  tempsADepenser: number;
  sommeDurees: number;
  heureDebut: string;
  heureDeFin: Date;
  midiPause: number;
  jaiMange: boolean;
}>();

const formatDuree = (value: number) => {
  const heures = Math.floor(Math.abs(value) / 60);
  const minutes = Math.abs(value) % 60;
  return `${String(heures).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const today = new Date().toDateString();

const nbProjetsActifs = computed(
  () =>
    props.projets.filter(
      (p) =>
        !p.isArchived && p.durees.some((d) => d.date === today && d.duree > 0),
    ).length,
);

const topProjet = computed<{ nom: string; duree: number } | null>(() => {
  let best: { nom: string; duree: number } | null = null;
  props.projets.forEach((p) => {
    const d = p.durees.find((d) => d.date === today);
    if (d && d.duree > 0 && (!best || d.duree > best.duree)) {
      best = { nom: p.nom, duree: d.duree };
    }
  });
  return best;
});

const tempsTotal = computed(() => {
  return props.sommeDurees + (props.jaiMange ? props.midiPause : 0);
});

const segments = computed(() => {
  if (tempsTotal.value <= 0) return [];
  return props.projets
    .map((p) => {
      const d = p.durees.find((d) => d.date === today);
      const duree = d?.duree ?? 0;
      return {
        nom: p.nom,
        duree,
        couleur: p.couleur ?? "#6366f1",
        pourcent: (duree / tempsTotal.value) * 100,
      };
    })
    .filter((s) => s.duree > 0);
});

const pausePourcent = computed(() => {
  if (tempsTotal.value <= 0 || !props.jaiMange) return 0;
  return (props.midiPause / tempsTotal.value) * 100;
});
</script>

<style scoped>
.dashboard-resume {
  padding: 1.25rem;
  border-radius: 1rem;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.05),
    rgba(139, 92, 246, 0.05)
  );
  border: 1px solid rgba(99, 102, 241, 0.15);
  margin-bottom: 1.5rem;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  flex-shrink: 0;
}
.progress-bar-container {
  margin-top: 0.5rem;
}
.progress-track {
  display: flex;
  height: 0.625rem;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.08);
}
.progress-segment {
  height: 100%;
  min-width: 2px;
}
.progress-segment:first-child {
  border-radius: 999px 0 0 999px;
}
.progress-segment:last-child {
  border-radius: 0 999px 999px 0;
}
</style>
