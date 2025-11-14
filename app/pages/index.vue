<template>
  <div class="text-sm">
    <div class="p-2 mb-4 border border-primary/40">
      <div>
        <div class="flex justify-between items-baseline">
          <div>
            J'ai commencé à
            <USelect :items="heureDebutListe" v-model="heureDebut" />
          </div>
          {{
            tempsADepenser >= 0
              ? "Il me reste à attribuer :" + formatDuree(tempsADepenser)
              : "J'ai trop attribué de :" + formatDuree(tempsADepenser + 30)
          }}
        </div>
        <USlider
          v-if="tempsADepenser >= 0"
          class="my-4"
          v-model="tempsADepenser"
          disabled
          :min="0"
          :max="600"></USlider>
        <USlider
          v-else
          class="my-4"
          v-model="tempsADepenser"
          disabled
          :max="-600"
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
          :max="240"
          v-model="midiPause" />
      </div>
    </div>
    <div
      class="pb-6 px-4 pt-2 bg-primary/10 odd:bg-white dark:odd:bg-uibg grid grid-cols-[10em_1fr_1em] gap-4 justify-center items-center"
      v-for="e in projets"
      :key="e.nom">
      <div>{{ e.nom }}</div>
      <template v-for="k in dureesTotales" :key="`k-${k.nom}`">
        <div v-if="k.nom == e.nom">
          <div class="flex gap-1 justify-end items-baseline pb-2 text-right">
            <div class="text-sm">{{ formatDuree(k.duree) }}</div>
            <div class="text-xs italic opacity-65">{{ sommeDurees(e) }}</div>
          </div>
          <div>
            <USlider :step="30" :min="0" :max="600" v-model="k.duree">
            </USlider>
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
    </div>
  </div>
  <div class="flex gap-4 justify-end mt-8">
    <UButton
      @click="modalNouveauProjet = true"
      label="Ajouter un projet"
      color="neutral"
      variant="subtle" />
    <UButton
      @click="voirTout = !voirTout"
      :label="voirTout ? 'Masquer les projet' : 'Voir tous les projets'"
      color="neutral"
      variant="subtle" />
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
          @click="modalSupprimerProjet = false"
          variant="solid" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const projetsStore = useProjets();
projetsStore.fetchProjets();

const modalNouveauProjet = ref(false);
const modalSupprimerProjet = ref(false);
const nomSupprimerProjet = ref("");
const projetNom = ref("");
const voirTout = ref(false);
const midiPause = ref(90);
const heureDebut = ref("08:30");
const jaiMange = ref(false);
const jaiMangeClic = ref(false);
interface DureesTotale {
  nom: string;
  duree: number;
}
const dureesTotales: Ref<DureesTotale[]> = ref([]);

const projets: Ref<Projet[]> = computed(() => projetsStore.projets);

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
  return Math.round(minutes / 15) * 15;
});

const sommeDureesAujourdHhui = computed(() => {
  let retour = 0;
  projets.value.forEach((e) => {
    retour +=
      e.durees.find((j) => (j.date = new Date().toDateString()))?.duree ?? 0;
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
watch(
  projets,
  (nouv) => {
    nouv.forEach((e) => {
      const dureeTemp =
        e.durees.find((e) => e.date == new Date().toDateString())?.duree ?? 0;
      if (!dureesTotales.value.some((j) => j.nom == e.nom)) {
        dureesTotales.value.push({
          nom: e.nom,
          duree: dureeTemp,
        });
      }
    });
  },
  { deep: true }
);

watch(
  dureesTotales,
  (nouv, anc) => {
    if (!projets.value || projets.value.length == 0) return;
    const updated = projets.value.map((p) => {
      const copy = structuredClone(toRaw(p));
      const exist = nouv.find((d) => d.nom === p.nom);

      if (exist && exist.duree !== 0) {
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
  { deep: true }
);

const formatDuree = (value: number) => {
  const heures = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(heures).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
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
});
</script>

<style scoped></style>
