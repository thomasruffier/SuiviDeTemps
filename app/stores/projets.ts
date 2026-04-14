export const useProjets = defineStore("projets", () => {
  const { $db } = useNuxtApp();
  const payload = usePayload();
  const projets = ref<Projet[]>([]);

  // Couleurs prédéfinies pour les projets
  const couleursDisponibles = [
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#f43f5e", // rose
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#3b82f6", // blue
  ];

  async function fetchProjets() {
    const saved: any = await $db.getItem("projets");
    projets.value = saved ? reviveProjets(saved) : [];
    return projets.value;
  }

  function reviveProjets(data: any[]): Projet[] {
    return data.map((p, index) => ({
      nom: p.nom,
      derniereModification: p.derniereModification,
      durees: p.durees.map((d: any) => ({
        date: d.date,
        duree: d.duree,
        note: d.note ?? "",
      })),
      isArchived: p.isArchived ?? false,
      description: p.description ?? "",
      couleur:
        p.couleur ?? couleursDisponibles[index % couleursDisponibles.length],
    }));
  }

  async function saveProjets() {
    const raw = toRaw(projets.value);
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
          note: "",
        },
      ],
      derniereModification: new Date().toDateString(),
      isArchived: false,
      description: "",
      couleur:
        couleursDisponibles[projets.value.length % couleursDisponibles.length],
    });

    await saveProjets();
    void payload.syncProjet(projets.value[projets.value.length - 1]!, projets.value.length - 1);
    return true;
  }

  function deleteProjet(nom: string) {
    const index = projets.value.findIndex((e) => e.nom === nom);
    if (index === -1) return false;

    projets.value.splice(index, 1);
    saveProjets();
    void payload.deleteProjet(nom);
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
      note: "",
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
    void payload.syncSession(nom, madate.toDateString(), duree, item?.note ?? '');
  }

  async function incrementDuree(nom: string, madate: Date, delta: number) {
    const projet = projets.value.find((p) => p.nom === nom);
    if (!projet) return;

    const dateKey = madate.toDateString();

    let entry = projet.durees.find((d) => d.date === dateKey);
    if (!entry) {
      entry = { date: dateKey, duree: 0, note: "" };
      projet.durees.push(entry);
    }

    entry.duree += delta;

    await saveProjets();
    void payload.syncSession(nom, dateKey, entry.duree, entry.note ?? '');
  }

  async function updateAllProjets(projet: Projet[]) {
    projets.value = projet;
    await saveProjets();
    return true;
  }

  async function archiveProjet(nom: string) {
    const projet = projets.value.find((e) => e.nom === nom);
    if (!projet) return false;

    projet.isArchived = true;
    await saveProjets();
    void payload.syncProjet(projet);
    return true;
  }

  async function unarchiveProjet(nom: string) {
    const projet = projets.value.find((e) => e.nom === nom);
    if (!projet) return false;

    projet.isArchived = false;
    await saveProjets();
    void payload.syncProjet(projet);
    return true;
  }

  async function renameProjet(ancienNom: string, nouveauNom: string) {
    if (projets.value.some((e) => e.nom === nouveauNom)) return false;
    const projet = projets.value.find((e) => e.nom === ancienNom);
    if (!projet) return false;

    projet.nom = nouveauNom;
    projet.derniereModification = new Date().toDateString();
    await saveProjets();
    // Supprime l'ancien doc Payload et crée le nouveau
    void payload.deleteProjet(ancienNom).then(() => payload.syncProjet(projet));
    return true;
  }

  async function updateNote(nomProjet: string, date: string, note: string) {
    const projet = projets.value.find((e) => e.nom === nomProjet);
    if (!projet) return false;

    const duree = projet.durees.find((d) => d.date === date);
    if (!duree) return false;

    duree.note = note;
    projet.derniereModification = new Date().toDateString();
    await saveProjets();
    void payload.syncSession(nomProjet, date, duree.duree, note);
    return true;
  }

  async function updateDescription(nomProjet: string, description: string) {
    const projet = projets.value.find((e) => e.nom === nomProjet);
    if (!projet) return false;

    projet.description = description;
    projet.derniereModification = new Date().toDateString();
    await saveProjets();
    void payload.syncProjet(projet);
    return true;
  }

  async function updateCouleur(nomProjet: string, couleur: string) {
    const projet = projets.value.find((e) => e.nom === nomProjet);
    if (!projet) return false;

    projet.couleur = couleur;
    await saveProjets();
    void payload.syncProjet(projet);
    return true;
  }

  function getStats(
    date: Date = new Date(),
    mode: "week" | "month" = "week",
    locale: string = "fr-FR",
  ) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    if (mode === "week") {
      const jour = start.getDay();
      start.setDate(start.getDate() - (jour === 0 ? 6 : jour - 1));
    } else {
      start.setDate(1);
    }

    const jours: {
      date: string;
      label: string;
      projets: { nom: string; duree: number; couleur: string; note: string }[];
    }[] = [];

    const iterations =
      mode === "week"
        ? 7
        : new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();

    for (let i = 0; i < iterations; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toDateString();
      const label = d.toLocaleDateString(locale, {
        weekday: mode === "week" ? "short" : undefined,
        day: "numeric",
        month: mode === "month" ? "short" : undefined,
      });

      const projetsDuJour: {
        nom: string;
        duree: number;
        couleur: string;
        note: string;
      }[] = [];

      projets.value.forEach((p) => {
        const entry = p.durees.find((dur) => dur.date === dateStr);
        if (entry && entry.duree > 0) {
          projetsDuJour.push({
            nom: p.nom,
            duree: entry.duree,
            couleur: p.couleur ?? "#6366f1",
            note: entry.note ?? "",
          });
        }
      });

      jours.push({ date: dateStr, label, projets: projetsDuJour });
    }

    return jours;
  }

  return {
    projets,
    couleursDisponibles,
    fetchProjets,
    createProjet,
    updateProjet,
    incrementDuree,
    updateAllProjets,
    saveProjets,
    deleteProjet,
    archiveProjet,
    unarchiveProjet,
    renameProjet,
    updateNote,
    updateDescription,
    updateCouleur,
    getStats,
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
      void payload.deleteSession(nom, date);
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
            // Sync tout vers Payload après l'import
            void payload.syncAll(importedProjets);
          } catch (error) {
            console.error("Erreur lors de l'importation des projets:", error);
          }
        }
      };
      reader.readAsText(file);
    },
  };
});
