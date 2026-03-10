<template>
  <div class="mb-4 text-3xl text-center font-titre">
    Suivi de temps La Pierre qui Mousse
  </div>
  <SvgLogo class="mx-auto mb-8 w-20" />
  <div class="text-sm">
    <div class="p-2 mb-8 border border-primary/40">
      <div>
        <div class="flex justify-between items-baseline">
          <div>
            J'ai commencé à
            <USelect :items="heureDebutListe" v-model="heureDebut" />
          </div>
          {{
            tempsADepenser >= 0
              ? "Il me reste à attribuer : " + formatDuree(tempsADepenser)
              : "J'ai trop attribué de :" + formatDuree(tempsADepenser + 30)
          }}.
          <span class="p-2 text-xs rounded-2xl bg-primary/10">
            J'ai fini à
            {{
              heureDeFin.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </span>
        </div>
        <USlider
          v-if="tempsADepenser >= 0"
          class="my-4"
          v-model="tempsADepenser"
          disabled
          :min="0"
          :max="6000"></USlider>
        <USlider
          v-else
          class="my-4"
          v-model="tempsADepenser"
          disabled
          :max="-6000"
          :ui="{
            track: 'bg-gray-200',
            range: 'bg-red-500',
            thumb: 'bg-red-700 ring-red-700',
          }"
          :min="0"></USlider>
      </div>
      <div class="">
        <div class="flex justify-between w-full">
          <div>Pause midi : {{ formatDuree(midiPause) }}</div>
          <div></div>
          <label class="flex gap-2">
            J'ai déjà mangé ?<UCheckbox
              @click="jaiMangeClic = true"
              v-model="jaiMange" />
          </label>
        </div>
        <USlider
          :ui="{
            track: 'bg-green-100',
            range: 'bg-green-500',
            thumb: 'bg-green-700 ring-green-700',
          }"
          :step="30"
          class="my-4"
          :min="0"
          :max="300"
          v-model="midiPause" />
      </div>
      <div class="flex justify-end w-full">
        <URadioGroup
          :items="[{ label: 'Je règle mon temps manuellement', value: '' }]"
          v-model="jetravaillesur" />
      </div>
    </div>
    <div class="flex gap-2 justify-between pb-2 border-b border-b-gray-200">
      <UButton
        @click="toggleTri"
        size="xs"
        :label="triParNom ? 'Trier par durée' : 'Trier par nom'"
        color="neutral"
        variant="subtle" />
      <UButton
        @click="afficherArchives = !afficherArchives"
        :label="afficherArchives ? 'Masquer les archivés' : 'Voir les archivés'"
        size="xs"
        color="neutral"
        variant="subtle" />
    </div>

    <div
      class="pb-6 px-4 pt-2 bg-primary/10 odd:bg-white dark:odd:bg-uibg grid grid-cols-[10em_1fr_1em] gap-4 justify-center items-center"
      v-for="e in projetsComp"
      :key="e.nom">
      <div :class="e.isArchived ? 'text-amber-700' : ''">{{ e.nom }}</div>
      <template v-for="k in dureesTotales" :key="`k-${k.nom}`">
        <div v-if="k.nom == e.nom">
          <div class="flex gap-4 justify-end items-center pb-2 text-right">
            <div class="text-sm">{{ formatDuree(k.duree) }}</div>
            <div class="text-xs italic opacity-65">{{ sommeDurees(e) }}</div>
            <div>
              <URadioGroup
                size="xs"
                :items="[{ label: 'Je travaille dessus', value: e.nom }]"
                v-model="jetravaillesur" />
            </div>
            <UButton
              @click="toggleSlider(e)"
              :label="
                sliderVisible[e.nom]
                  ? 'Masquer les jours'
                  : 'Voir tous les jours'
              "
              color="neutral"
              variant="subtle"
              size="xs" />
          </div>
          <div>
            <USlider :step="30" :min="0" :max="720" v-model="k.duree">
            </USlider>
          </div>
          <div v-if="sliderVisible[e.nom]">
            <SliderJours
              :projet="e"
              @update-duree="
                (date: string, duree: number) =>
                  onJourDureeUpdate(e.nom, date, duree)
              "
              @supprimer-jour="
                (date: string) => onJourSupprimer(e.nom, date)
              " />
          </div>
        </div>
      </template>

      <UIcon
        class="cursor-pointer hover:text-primary"
        name="lucide-trash"
        label="Supprimer le projet"
        @click="
          modalSupprimerProjet = true;
          nomSupprimerProjet = e.nom;
        "
        color="neutral"
        variant="subtle" />
      <UIcon
        class="cursor-pointer hover:text-primary"
        :class="e.isArchived ? 'bg-amber-700' : ''"
        :name="e.isArchived ? 'lucide-archive-restore' : 'lucide-archive'"
        :label="e.isArchived ? 'Désarchiver le projet' : 'Archiver le projet'"
        @click="
          e.isArchived
            ? projetsStore.unarchiveProjet(e.nom)
            : projetsStore.archiveProjet(e.nom)
        "
        color="neutral"
        variant="subtle" />
    </div>
  </div>
  <div class="flex gap-4 justify-end mt-8">
    <UButton
      @click="modalNouveauProjet = true"
      label="Ajouter un projet"
      color="neutral"
      variant="subtle" />

    <UButton
      @click="projetsStore.exportProjets()"
      label="Exporter Projet"
      color="neutral"
      variant="subtle" />
    <UButton
      @click="fileInput?.click()"
      label="Importer Projet"
      color="neutral"
      variant="subtle" />
    <input
      type="file"
      ref="fileInput"
      style="display: none"
      @change="handleFileImport" />
  </div>

  <pre class="text-xs" v-if="voirTout">{{ projets }}</pre>
  <UModal
    scrollable
    title="Ajouter un projet"
    v-model:open="modalNouveauProjet">
    <template #body>
      <UFormField label="Nom">
        <UInput
          class="w-full"
          v-model="projetNom"
          placeholder="Nom du projet" />
      </UFormField>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton
          :label="`Ajouter ${projetNom}`"
          color="neutral"
          @click="
            projetsStore.createProjet(projetNom);
            modalNouveauProjet = false;
            projetNom = '';
          "
          variant="solid" />
      </div>
    </template>
  </UModal>
  <UModal
    scrollable
    title="Supprimer le projet"
    v-model:open="modalSupprimerProjet">
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton
          :label="`Supprimer`"
          color="neutral"
          @click="
            modalSupprimerProjet = false;
            projetsStore.deleteProjet(nomSupprimerProjet);
            nomSupprimerProjet = '';
          "
          variant="solid" />
      </div>
    </template>
  </UModal>
  <pre class="text-xs">{{ projets }}</pre>
</template>

<script setup lang="ts">
const projetsStore = useProjets();
projetsStore.fetchProjets();

const triParNom = ref(true);
const afficherArchives = ref(false);

function toggleTri() {
  triParNom.value = !triParNom.value;
}

const modalNouveauProjet = ref(false);
const modalSupprimerProjet = ref(false);
const nomSupprimerProjet = ref("");
const projetNom = ref("");
const voirTout = ref(false);
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

// --- Handlers pour l'édition jour par jour (SliderJours) ---
async function onJourDureeUpdate(
  nomProjet: string,
  date: string,
  duree: number,
) {
  await projetsStore.updateProjet(nomProjet, duree, new Date(date));

  // Si c'est aujourd'hui, mettre aussi à jour dureesTotales pour synchroniser la jauge
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

  // On ne fait quelque chose que si le temps à répartir augmente
  if (nouv > 0) {
    await projetsStore.incrementDuree(nom, new Date(), nouv);

    // Mettre à jour la durée totale pour le projet en cours
    const projet = projets.value.find((p) => p.nom === nom);
    if (projet) {
      const dureeTotaleProjet = dureesTotales.value.find((d) => d.nom === nom);
      if (dureeTotaleProjet) {
        dureeTotaleProjet.duree = nouv;
      } else {
        dureesTotales.value.push({
          nom: nom,
          duree: nouv,
        });
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
        dureesTotales.value.push({
          nom: e.nom,
          duree: dureeTemp,
        });
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
          copy.durees.push({
            date: today,
            duree: exist.duree,
          });
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
  return `${String(heures).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
};
const calculJour = (value: number) => {
  const demiJour = 180;
  const tolerance = 120;
  let demiJoursEntiers = Math.floor(value / demiJour);
  const reste = value % demiJour;
  if (reste > tolerance) demiJoursEntiers += 1;
  return demiJoursEntiers / 2;
};
function sommeDurees(e: Projet) {
  let temp = 0;
  e.durees.forEach((j) => {
    temp += j.duree ?? 0;
  });
  return `soit un total de ${calculJour(temp)} jour`;
}

watch(now, (nouv) => {
  if (nouv.getHours() > 13 && !jaiMangeClic.value) jaiMange.value = true;

  // Détection du changement de jour (reset minuit)
  const today = nouv.toDateString();
  if (today !== currentDay.value) {
    currentDay.value = today;

    // Reset toutes les jauges pour le nouveau jour
    dureesTotales.value = dureesTotales.value.map((d) => ({
      nom: d.nom,
      duree: 0,
    }));

    // Reset l'état de travail
    jetravaillesur.value = "";
    jaiMange.value = false;
    jaiMangeClic.value = false;
  }
});
</script>

<style scoped></style>
