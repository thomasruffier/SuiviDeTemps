<template>
  <div
    class="projet-card"
    :class="{
      'projet-card--active': isActive,
      'projet-card--archived': projet.isArchived,
    }"
    :style="{ '--projet-color': projet.couleur ?? '#6366f1' }">
    <!-- Header -->
    <div class="projet-card__header">
      <div class="flex items-center gap-2 min-w-0">
        <UIcon
          v-if="canDrag"
          name="lucide-grip-vertical"
          class="drag-handle opacity-20 transition-opacity cursor-grab active:cursor-grabbing hover:opacity-100" />
        <div
          class="w-3 h-3 rounded-full shrink-0 ring-2 ring-offset-1 transition-all"
          :class="
            isActive
              ? 'ring-(--projet-color) scale-125'
              : 'ring-transparent'
          "
          :style="{ backgroundColor: projet.couleur ?? '#6366f1' }"></div>
        <div class="min-w-0">
          <h3
            class="font-semibold text-sm truncate"
            :class="projet.isArchived ? 'opacity-50 line-through' : ''">
            {{ projet.nom }}
          </h3>
          <p v-if="projet.description" class="text-xs opacity-50 truncate">
            {{ projet.description }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <UButton
          v-if="!isActive"
          @click="$emit('select', projet.nom)"
          icon="lucide-play"
          :label="$t('project.work')"
          size="xs"
          :style="{ '--ui-primary': projet.couleur }"
          color="primary"
          variant="soft" />
        <UButton
          v-else
          @click="$emit('select', '')"
          icon="lucide-pause"
          :label="$t('project.inProgress')"
          size="xs"
          color="primary"
          variant="solid"
          :style="{ '--ui-primary': projet.couleur }" />
        <UDropdownMenu :items="menuItems" dir="rtl">
          <UButton
            icon="lucide-more-vertical"
            color="neutral"
            variant="ghost"
            size="xs" />
        </UDropdownMenu>
      </div>
    </div>

    <!-- Durée du jour + slider -->
    <div class="projet-card__body">
      <div class="flex justify-between items-baseline mb-1.5">
        <div class="flex items-baseline gap-2">
          <span
            class="text-2xl font-bold font-mono tabular-nums"
            :style="{ color: projet.couleur }">
            {{ formatDuree(dureeTotale) }}
          </span>
          <span class="text-xs opacity-50">{{ $t('project.today') }}</span>
        </div>
        <div class="text-xs opacity-50 italic">
          {{ $t('project.total') }} : {{ calculJour(sommeTotale) }} j
        </div>
      </div>

      <!-- Barre visuelle -->
      <div class="progress-mini-track mb-2">
        <div
          class="progress-mini-fill transition-all duration-500"
          :style="{
            width: Math.min((dureeTotale / 480) * 100, 100) + '%',
            backgroundColor: projet.couleur ?? '#6366f1',
          }"></div>
      </div>

      <!-- Slider -->
      <USlider
        :step="30"
        :min="0"
        :max="720"
        :model-value="dureeTotale"
        @update:model-value="
          (val: number | undefined) => {
            if (val !== undefined) $emit('update-duree', val);
          }
        " />
    </div>

    <!-- Note du jour -->
    <div class="projet-card__note">
      <div class="flex items-center gap-1.5 mb-1">
        <UIcon name="lucide-pencil-line" class="text-xs opacity-40" />
        <span class="text-xs opacity-50">{{ $t('project.noteLabel') }}</span>
      </div>
      <input
        type="text"
        class="note-input"
        :placeholder="$t('project.notePrompt')"
        :value="noteAujourdHui"
        @change="
          (e: Event) =>
            $emit('update-note', (e.target as HTMLInputElement).value)
        " />
    </div>

    <!-- Historique (collapsible) -->
    <div v-if="sliderVisible" class="projet-card__history">
      <SliderJours
        :projet="projet"
        @update-duree="
          (date: string, duree: number) =>
            $emit('jour-update-duree', date, duree)
        "
        @supprimer-jour="(date: string) => $emit('jour-supprimer', date)"
        @update-note="
          (date: string, note: string) => $emit('jour-update-note', date, note)
        " />
    </div>

    <!-- Footer toggle -->
    <button class="projet-card__footer" @click="$emit('toggle-slider')">
      <UIcon
        :name="sliderVisible ? 'lucide-chevron-up' : 'lucide-chevron-down'"
        class="text-sm opacity-50" />
      <span class="text-xs opacity-50">
        {{ sliderVisible ? $t('project.hideHistory') : $t('project.showHistory') }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Projet } from "~/types/Types";

const props = defineProps<{
  projet: Projet;
  dureeTotale: number;
  isActive: boolean;
  sliderVisible: boolean;
  canDrag?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", nom: string): void;
  (e: "update-duree", duree: number): void;
  (e: "update-note", note: string): void;
  (e: "toggle-slider"): void;
  (e: "jour-update-duree", date: string, duree: number): void;
  (e: "jour-supprimer", date: string): void;
  (e: "jour-update-note", date: string, note: string): void;
  (e: "archive"): void;
  (e: "unarchive"): void;
  (e: "delete"): void;
  (e: "rename"): void;
}>();

const today = new Date().toDateString();

const noteAujourdHui = computed(() => {
  const duree = props.projet.durees.find((d) => d.date === today);
  return duree?.note ?? "";
});

const sommeTotale = computed(() => {
  let total = 0;
  props.projet.durees.forEach((d) => {
    total += d.duree ?? 0;
  });
  return total;
});

const formatDuree = (value: number) => {
  const heures = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(heures).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const calculJour = (value: number) => {
  const demiJour = 180;
  const tolerance = 120;
  let demiJoursEntiers = Math.floor(value / demiJour);
  const reste = value % demiJour;
  if (reste > tolerance) demiJoursEntiers += 1;
  return demiJoursEntiers / 2;
};

const menuItems = computed(() => [
  [
    {
      label: props.projet.isArchived ? useI18n().t('project.unarchive') : useI18n().t('project.archive'),
      icon: props.projet.isArchived ? "lucide-archive-restore" : "lucide-archive",
      onSelect: () => {
        if (props.projet.isArchived) emit("unarchive");
        else emit("archive");
      },
    },
    {
      label: useI18n().t('project.rename'),
      icon: "lucide-pen",
      onSelect: () => emit("rename"),
    },
    {
      label: useI18n().t('project.delete'),
      icon: "lucide-trash-2",
      color: "error" as const,
      onSelect: () => emit("delete"),
    },
  ],
]);
</script>

<style scoped>
.projet-card {
  border-radius: 1rem;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  overflow: hidden;
  transition:
    box-shadow 0.3s,
    border-color 0.3s,
    transform 0.2s;
}
.projet-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}
.projet-card--active {
  border-color: var(--projet-color);
  box-shadow:
    0 0 0 1px var(--projet-color),
    0 4px 20px rgba(0, 0, 0, 0.08);
}
.projet-card--archived {
  opacity: 0.6;
}
.projet-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--ui-border);
}
.projet-card__body {
  padding: 1rem;
}
.projet-card__note {
  padding: 0 1rem 0.75rem;
}
.projet-card__history {
  padding: 0 0.75rem 0.75rem;
}
.projet-card__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: 100%;
  padding: 0.5rem;
  border-top: 1px solid var(--ui-border);
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
}
.projet-card__footer:hover {
  background: rgba(0, 0, 0, 0.03);
}
.note-input {
  width: 100%;
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
  border: 1px solid var(--ui-border);
  background: transparent;
  font-size: 0.8125rem;
  outline: none;
  transition: border-color 0.2s;
}
.note-input:focus {
  border-color: var(--projet-color, var(--color-primary));
}
.note-input::placeholder {
  opacity: 0.4;
}
.progress-mini-track {
  height: 4px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.progress-mini-fill {
  height: 100%;
  border-radius: 999px;
}
</style>
