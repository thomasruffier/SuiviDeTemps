export const useProjets = defineStore("projets", () => {
  const { $db } = useNuxtApp();
  const projets = ref<Projet[]>([]);

  async function fetchProjets() {
    const saved: any = await $db.getItem("projets");
    projets.value = saved ? reviveProjets(saved) : [];
    return projets.value;
  }

  function reviveProjets(data: any[]): Projet[] {
    return data.map((p) => ({
      nom: p.nom,
      derniereModification: new Date(p.derniereModification).toDateString(),
      durees: p.durees.map((d: any) => ({
        date: new Date().toDateString(),
        duree: d.duree,
      })),
    }));
  }

  async function saveProjets() {
    const raw = toRaw(projets.value); // enlève tous les proxies
    await $db.setItem("projets", structuredClone(raw));
  }

  async function createProjet(nom: string) {
    if (projets.value.some((e) => e.nom === nom)) return false;

    projets.value.push({
      nom,
      durees: [
        {
          duree: 0,
          date: new Date().toDateString(),
        },
      ],
      derniereModification: new Date().toDateString(),
    });

    await saveProjets();
    return true;
  }

  function deleteProjet(nom: string) {
    const index = projets.value.findIndex((e) => e.nom === nom);
    if (index === -1) return false;

    projets.value.splice(index, 1);
    saveProjets();
    return true;
  }

  async function addNewDateToProjet(
    nom: string,
    madate: Date,
    duree: number = 0
  ) {
    const projet = projets.value.find((e) => e.nom === nom);
    if (!projet) return false;

    projet.durees.push({
      date: madate.toDateString(),
      duree,
    });

    await saveProjets();
    return true;
  }

  async function updateProjet(nom: string, duree: number, madate: Date) {
    const projet = projets.value.find((e) => e.nom === nom);
    if (!projet) return false;

    const item = projet.durees.find((e) => e.date === madate.toDateString());

    if (!item) {
      await addNewDateToProjet(nom, madate, duree);
    } else {
      item.duree = duree;
      await saveProjets();
    }
  }
  async function incrementDuree(nom: string, madate: Date, delta: number) {
    const projet = projets.value.find((p) => p.nom === nom);
    if (!projet) return;

    const dateKey = madate.toDateString();

    let entry = projet.durees.find((d) => d.date === dateKey);
    if (!entry) {
      entry = { date: dateKey, duree: 0 };
      projet.durees.push(entry);
    }

    entry.duree += delta;

    await saveProjets();
  }
  async function updateAllProjets(projet: Projet[]) {
    projets.value = projet;
    await saveProjets();
    return true;
  }

  return {
    projets,
    fetchProjets,
    createProjet,
    updateProjet,
    incrementDuree,
    updateAllProjets,
    saveProjets,
    deleteProjet,
  };
});
