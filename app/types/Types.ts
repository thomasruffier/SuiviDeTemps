export interface Duree {
  date: string;
  duree: number;
}
export interface Projet {
  nom: string;
  durees: Duree[];
  derniereModification: string;
  isArchived?: boolean;
}
