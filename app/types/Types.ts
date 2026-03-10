export interface Duree {
  date: string;
  duree: number;
  note?: string;
}
export interface Projet {
  nom: string;
  durees: Duree[];
  derniereModification: string;
  isArchived?: boolean;
  description?: string;
  couleur?: string;
}
