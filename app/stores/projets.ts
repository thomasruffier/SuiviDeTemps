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
        date: new Date(d.date).toDateString(), // Conserver la date originale
        duree: d.duree,
      })),
      isArchived: p.isArchived ?? false,
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
      isArchived: false,
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
    duree: number = 0,
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

  function archiveProjet(nom: string) {
    const projet = projets.value.find((e) => e.nom === nom);
    if (!projet) return false;

    projet.isArchived = true;
    saveProjets();
    return true;
  }

  function unarchiveProjet(nom: string) {
    const projet = projets.value.find((e) => e.nom === nom);
    if (!projet) return false;

    projet.isArchived = false;
    saveProjets();
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
    archiveProjet,
    unarchiveProjet,
    deleteJourFromProjet: async function deleteJourFromProjet(
      nom: string,
      date: string,
    ) {
      const projet = projets.value.find((e) => e.nom === nom);
      if (!projet) return false;

      const index = projet.durees.findIndex((d) => d.date === date);
      if (index === -1) return false;

      projet.durees.splice(index, 1);
      await saveProjets();
      return true;
    },
    exportProjets: async function exportProjets() {
      const raw = toRaw(projets.value);
      const blob = new Blob([JSON.stringify(raw, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "projets.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    importProjets: async function importProjets(file: File) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          try {
            const importedProjets = JSON.parse(e.target.result as string);
            await updateAllProjets(importedProjets);
          } catch (error) {
            console.error("Erreur lors de l'importation des projets:", error);
          }
        }
      };
      reader.readAsText(file);
    },
  };
});
