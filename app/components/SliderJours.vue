<template>
  <div class="slider-jours">
    <div class="slider-header">
      <h3>Jours travaillés sur {{ projetNom }}</h3>
    </div>
    <div class="slider-container">
      <div class="slider-track" ref="sliderTrack">
        <div
          v-for="(jour, index) in jours"
          :key="index"
          class="slider-item"
          :style="{ left: `${index * 100}px` }">
          <div class="jour-date">{{ formatDate(jour.date) }}</div>
          <div class="jour-duree">{{ formatDuree(jour.duree) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Projet } from "~/types/Types";

const props = defineProps<{
  projet: Projet;
}>();

const projetNom = computed(() => props.projet.nom);
const jours = computed(() => props.projet.durees);

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
  return `${heures}h${minutes > 0 ? minutes : ""}`;
};
</script>

<style scoped>
.slider-jours {
  margin: 20px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.slider-header {
  margin-bottom: 15px;
  font-weight: bold;
}

.slider-container {
  position: relative;
  overflow-x: auto;
  white-space: nowrap;
}

.slider-track {
  position: relative;
  min-width: 100%;
}

.slider-item {
  display: inline-block;
  width: 90px;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  background: white;
  margin-right: 10px;
  text-align: center;
}

.jour-date {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.jour-duree {
  font-weight: bold;
  color: #333;
}
</style>
