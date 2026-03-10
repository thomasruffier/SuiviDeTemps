<template>
  <div class="mx-auto max-w-4xl">
    <!-- Header -->
    <div class="mb-6 text-center">
      <SvgLogo class="mx-auto mb-3 w-14 opacity-80" />
      <h1 class="text-2xl tracking-wide font-titre">Suivi de temps</h1>
      <p class="mt-1 text-xs opacity-40">La Pierre qui Mousse</p>
    </div>

    <!-- Paramètres de la journée (collapsible) -->
    <div class="mb-6 params-section">
      <button class="params-toggle" @click="paramsOuverts = !paramsOuverts">
        <div class="flex gap-2 items-center">
          <UIcon name="lucide-settings-2" class="text-sm opacity-50" />
          <span class="text-sm">Paramètres du jour</span>
        </div>
        <div class="flex gap-3 items-center">
          <span class="font-mono text-xs opacity-50">
            Début {{ heureDebut }} · Pause {{ formatDuree(midiPause) }}
          </span>
          <UIcon
            :name="paramsOuverts ? 'lucide-chevron-up' : 'lucide-chevron-down'"
            class="text-sm opacity-40" />
        </div>
      </button>
      <div v-if="paramsOuverts" class="params-body">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Heure de début -->
          <div>
            <label class="block mb-1 text-xs opacity-60">Heure de début</label>
            <USelect
              :items="heureDebutListe"
              v-model="heureDebut"
              class="w-full" />
          </div>
          <!-- Pause midi -->
          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="text-xs opacity-60"
                >Pause midi : {{ formatDuree(midiPause) }}</label
              >
              <label class="flex gap-2 items-center text-xs opacity-60">
                J'ai déjà mangé ?
                <UCheckbox @click="jaiMangeClic = true" v-model="jaiMange" />
              </label>
            </div>
            <USlider
              :ui="{
                track: 'bg-green-100',
                range: 'bg-green-500',
                thumb: 'bg-green-700 ring-green-700',
              }"
              :step="30"
              :min="0"
              :max="300"
              v-model="midiPause" />
          </div>
        </div>
        <!-- Mode manuel -->
        <div class="flex justify-end mt-3">
          <URadioGroup
            :items="[{ label: 'Je règle mon temps manuellement', value: '' }]"
            v-model="jetravaillesur" />
        </div>
      </div>
    </div>

    <!-- Dashboard résumé -->
    <DashboardResume
      :projets="projets"
      :temps-a-depenser="tempsADepenser"
      :somme-durees="sommeDureesAujourdHhui"
      :heure-debut="heureDebut"
      :heure-de-fin="heureDeFin"
      :midi-pause="midiPause"
      :jai-mange="jaiMange" />

    <!-- Contrôles de tri / filtre -->
    <div class="flex gap-2 justify-between items-center mb-4">
      <div class="flex gap-2">
        <UButton
          @click="toggleTri"
          size="xs"
          :icon="
            triParNom
              ? 'lucide-arrow-down-a-z'
              : 'lucide-arrow-down-wide-narrow'
          "
          :label="triParNom ? 'Par durée' : 'Par nom'"
          color="neutral"
          variant="subtle" />
        <UButton
          @click="afficherArchives = !afficherArchives"
          size="xs"
          :icon="afficherArchives ? 'lucide-eye-off' : 'lucide-archive'"
          :label="afficherArchives ? 'Masquer archivés' : 'Voir archivés'"
          color="neutral"
          variant="subtle" />
      </div>
      <UButton
        @click="modalNouveauProjet = true"
        size="xs"
        icon="lucide-plus"
        label="Nouveau projet"
        color="primary"
        variant="solid" />
    </div>

    <!-- Grille des projets -->
    <div class="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2">
      <ProjetCard
        v-for="e in projetsComp"
        :key="e.nom"
        :projet="e"
        :duree-totale="getDureeTotale(e.nom)"
        :is-active="jetravaillesur === e.nom"
        :slider-visible="!!sliderVisible[e.nom]"
        @select="(nom: string) => (jetravaillesur = nom)"
        @update-duree="(duree: number) => setDureeTotale(e.nom, duree)"
        @update-note="
          (note: string) =>
            projetsStore.updateNote(e.nom, new Date().toDateString(), note)
        "
        @toggle-slider="toggleSlider(e)"
        @jour-update-duree="
          (date: string, duree: number) => onJourDureeUpdate(e.nom, date, duree)
        "
        @jour-supprimer="(date: string) => onJourSupprimer(e.nom, date)"
        @jour-update-note="
          (date: string, note: string) =>
            projetsStore.updateNote(e.nom, date, note)
        "
        @archive="projetsStore.archiveProjet(e.nom)"
        @unarchive="projetsStore.unarchiveProjet(e.nom)"
        @delete="
          modalSupprimerProjet = true;
          nomSupprimerProjet = e.nom;
        "
        @rename="
          modalRenommerProjet = true;
          nomRenommerProjet = e.nom;
          nouveauNomProjet = e.nom;
        " />
    </div>

    <!-- Stats hebdomadaires -->
    <StatsHebdo :projets="projets" class="mb-8" />

    <!-- Actions globales -->
    <div class="flex gap-2 justify-center pb-8">
      <UButton
        @click="projetsStore.exportProjets()"
        icon="lucide-download"
        label="Exporter"
        size="xs"
        color="neutral"
        variant="subtle" />
      <UButton
        @click="fileInput?.click()"
        icon="lucide-upload"
        label="Importer"
        size="xs"
        color="neutral"
        variant="subtle" />
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        @change="handleFileImport" />
    </div>

    <!-- Modal Nouveau Projet -->
    <UModal scrollable title="Nouveau projet" v-model:open="modalNouveauProjet">
      <template #body>
        <UFormField label="Nom du projet">
          <UInput
            class="w-full"
            v-model="projetNom"
            placeholder="Nom du projet"
            @keyup.enter="createAndClose" />
        </UFormField>
      </template>
      <template #footer>
        <div class="flex justify-end w-full">
          <UButton
            :label="`Créer ${projetNom}`"
            color="primary"
            @click="createAndClose"
            variant="solid"
            :disabled="!projetNom.trim()" />
        </div>
      </template>
    </UModal>

    <!-- Modal Supprimer Projet -->
    <UModal
      scrollable
      title="Supprimer le projet"
      v-model:open="modalSupprimerProjet">
      <template #body>
        <p class="text-sm">
          Êtes-vous sûr de vouloir supprimer
          <strong>{{ nomSupprimerProjet }}</strong> et tout son historique ?
        </p>
      </template>
      <template #footer>
        <div class="flex gap-2 justify-end w-full">
          <UButton
            label="Annuler"
            color="neutral"
            variant="subtle"
            @click="modalSupprimerProjet = false" />
          <UButton
            label="Supprimer"
            color="error"
            variant="solid"
            @click="deleteAndClose" />
        </div>
      </template>
    </UModal>

    <!-- Modal Renommer Projet -->
    <UModal
      scrollable
      title="Renommer le projet"
      v-model:open="modalRenommerProjet">
      <template #body>
        <UFormField label="Nouveau nom">
          <UInput
            class="w-full"
            v-model="nouveauNomProjet"
            placeholder="Nouveau nom"
            @keyup.enter="renameAndClose" />
        </UFormField>
      </template>
      <template #footer>
        <div class="flex justify-end w-full">
          <UButton
            label="Renommer"
            color="primary"
            @click="renameAndClose"
            variant="solid"
            :disabled="
              !nouveauNomProjet.trim() || nouveauNomProjet === nomRenommerProjet
            " />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const projetsStore = useProjets();
projetsStore.fetchProjets();

const triParNom = ref(true);
const afficherArchives = ref(false);
const paramsOuverts = ref(false);

function toggleTri() {
  triParNom.value = !triParNom.value;
}

const modalNouveauProjet = ref(false);
const modalSupprimerProjet = ref(false);
const modalRenommerProjet = ref(false);
const nomSupprimerProjet = ref("");
const nomRenommerProjet = ref("");
const nouveauNomProjet = ref("");
const projetNom = ref("");
const midiPause = ref(90);
const heureDebut = ref("08:30");
const jaiMange = ref(false);
const jaiMangeClic = ref(false);
const jetravaillesur = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const sliderVisible = ref<Record<string, boolean>>({});

interface DureesTotale {
  nom: string;
  duree: number;
}
const dureesTotales: Ref<DureesTotale[]> = ref([]);

// --- Détection du changement de jour (reset minuit) ---
const currentDay = ref(new Date().toDateString());

function toggleSlider(projet: Projet) {
  sliderVisible.value[projet.nom] = !sliderVisible.value[projet.nom];
}

function getDureeTotale(nom: string): number {
  return dureesTotales.value.find((d) => d.nom === nom)?.duree ?? 0;
}

function setDureeTotale(nom: string, duree: number) {
  const dt = dureesTotales.value.find((d) => d.nom === nom);
  if (dt) {
    dt.duree = duree;
  } else {
    dureesTotales.value.push({ nom, duree });
  }
}

function createAndClose() {
  if (!projetNom.value.trim()) return;
  projetsStore.createProjet(projetNom.value.trim());
  modalNouveauProjet.value = false;
  projetNom.value = "";
}

function deleteAndClose() {
  modalSupprimerProjet.value = false;
  projetsStore.deleteProjet(nomSupprimerProjet.value);
  nomSupprimerProjet.value = "";
}

function renameAndClose() {
  if (
    !nouveauNomProjet.value.trim() ||
    nouveauNomProjet.value === nomRenommerProjet.value
  )
    return;
  // Also update dureesTotales key
  const dt = dureesTotales.value.find((d) => d.nom === nomRenommerProjet.value);
  if (dt) dt.nom = nouveauNomProjet.value.trim();

  // Update sliderVisible
  if (sliderVisible.value[nomRenommerProjet.value]) {
    sliderVisible.value[nouveauNomProjet.value.trim()] = true;
    delete sliderVisible.value[nomRenommerProjet.value];
  }

  // Update jetravaillesur if needed
  if (jetravaillesur.value === nomRenommerProjet.value) {
    jetravaillesur.value = nouveauNomProjet.value.trim();
  }

  projetsStore.renameProjet(
    nomRenommerProjet.value,
    nouveauNomProjet.value.trim(),
  );
  modalRenommerProjet.value = false;
  nomRenommerProjet.value = "";
  nouveauNomProjet.value = "";
}

// --- Handlers pour l'édition jour par jour (SliderJours) ---
async function onJourDureeUpdate(
  nomProjet: string,
  date: string,
  duree: number,
) {
  await projetsStore.updateProjet(nomProjet, duree, new Date(date));

  // Si c'est aujourd'hui, mettre aussi à jour dureesTotales
  if (date === new Date().toDateString()) {
    const dt = dureesTotales.value.find((d) => d.nom === nomProjet);
    if (dt) dt.duree = duree;
  }
}

async function onJourSupprimer(nomProjet: string, date: string) {
  await projetsStore.deleteJourFromProjet(nomProjet, date);
}

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    projetsStore.importProjets(target.files[0]);
  }
}

const projets: Ref<Projet[]> = computed(() => projetsStore.projets);
const projetsComp = computed(() => {
  let filtered = projets.value;
  if (!afficherArchives.value) {
    filtered = filtered.filter((p) => !p.isArchived);
  }
  if (triParNom.value) {
    return filtered.sort((a, b) => a.nom.localeCompare(b.nom));
  } else {
    return filtered.sort((a, b) => {
      const dureeA =
        a.durees.find((d) => d.date === new Date().toDateString())?.duree ?? 0;
      const dureeB =
        b.durees.find((d) => d.date === new Date().toDateString())?.duree ?? 0;
      return dureeB - dureeA;
    });
  }
});

const heureDebutListe = ref([
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
]);

const heureDebutComp = computed(() => {
  const [h, m] = heureDebut.value.split(":").map(Number);
  return new Date().setHours(h ?? 0, m, 0, 0);
});

const now = useNow();
const tempsEcouleDepuisCeMatin = computed(() => {
  const diffMs = now.value.getTime() - heureDebutComp.value;
  const minutes = diffMs / 1000 / 60;
  return Math.round(minutes / 30) * 30;
});

const sommeDureesAujourdHhui = computed(() => {
  let retour = 0;
  projets.value.forEach((e) => {
    retour +=
      e.durees.find((j) => j.date === new Date().toDateString())?.duree ?? 0;
  });
  return retour;
});

const tempsADepenser = computed(() => {
  return (
    tempsEcouleDepuisCeMatin.value -
    sommeDureesAujourdHhui.value -
    (jaiMange.value ? midiPause.value : 0)
  );
});

watch(tempsADepenser, async (nouv, anc) => {
  const nom = jetravaillesur.value;
  if (!nom) return;

  if (nouv > 0) {
    await projetsStore.incrementDuree(nom, new Date(), nouv);

    const projet = projets.value.find((p) => p.nom === nom);
    if (projet) {
      const dureeTotaleProjet = dureesTotales.value.find((d) => d.nom === nom);
      if (dureeTotaleProjet) {
        dureeTotaleProjet.duree = nouv;
      } else {
        dureesTotales.value.push({ nom, duree: nouv });
      }
    }
  }
});

watch(
  projets,
  (nouv) => {
    nouv.forEach((e) => {
      const dureeTemp =
        e.durees.find((e) => e.date === new Date().toDateString())?.duree ?? 0;
      if (!dureesTotales.value.some((j) => j.nom == e.nom)) {
        dureesTotales.value.push({ nom: e.nom, duree: dureeTemp });
      }
    });
  },
  { deep: true },
);

watch(
  dureesTotales,
  (nouv, anc) => {
    if (!projets.value || projets.value.length == 0) return;
    const updated = projets.value.map((p) => {
      const copy = structuredClone(toRaw(p));
      const exist = nouv.find((d) => d.nom === p.nom);

      if (exist) {
        let today = new Date().toDateString();
        let d = copy.durees.find((x) => x.date === today);

        if (d) {
          d.duree = exist.duree;
        } else {
          copy.durees.push({ date: today, duree: exist.duree, note: "" });
        }
      }

      return copy;
    });

    projetsStore.updateAllProjets(updated);
  },
  { deep: true },
);

const heureDeFin = computed(() => {
  return new Date(
    heureDebutComp.value +
      sommeDureesAujourdHhui.value * 60000 +
      (jaiMange.value ? midiPause.value * 60000 : 0),
  );
});

const formatDuree = (value: number) => {
  const heures = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(heures).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

watch(now, (nouv) => {
  if (nouv.getHours() > 13 && !jaiMangeClic.value) jaiMange.value = true;

  // Détection du changement de jour (reset minuit)
  const today = nouv.toDateString();
  if (today !== currentDay.value) {
    currentDay.value = today;
    dureesTotales.value = dureesTotales.value.map((d) => ({
      nom: d.nom,
      duree: 0,
    }));
    jetravaillesur.value = "";
    jaiMange.value = false;
    jaiMangeClic.value = false;
  }
});
</script>

<style scoped>
.params-section {
  border-radius: 0.75rem;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  overflow: hidden;
}
.params-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
}
.params-toggle:hover {
  background: rgba(0, 0, 0, 0.02);
}
.params-body {
  padding: 0.75rem 1rem 1rem;
  border-top: 1px solid var(--ui-border);
}
</style>
