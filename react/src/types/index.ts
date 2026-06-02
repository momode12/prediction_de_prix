// Types pour l'authentification
export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// Types pour les prédictions
export interface PredictionInput {
  type_bien: string;
  surface_m2: number;
  nb_chambres: number;
  nombre_etages: number;
  annee_construction: number;
  etat_bien: string;
  region: string;
  quartier: string;
  prix_terrain_m2: number;
  accessibilite: string;
  douche_position: string;
  wc_position: string;
  garage: string;
  jardin: string;
  electricite: string;
  eau_courante: string;
  label?: string;
}

export interface Prediction extends PredictionInput {
  id: string;
  user_id: string;
  prix_predit: number;
  prix_predit_millions: number;
  created_at: string;
  updated_at: string;
}

export interface PredictionUpdate {
  label?: string;
  type_bien?: string;
  surface_m2?: number;
  nb_chambres?: number;
  nombre_etages?: number;
  annee_construction?: number;
  etat_bien?: string;
  region?: string;
  quartier?: string;
  prix_terrain_m2?: number;
  accessibilite?: string;
  douche_position?: string;
  wc_position?: string;
  garage?: string;
  jardin?: string;
  electricite?: string;
  eau_courante?: string;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PredictionsResponse {
  success: boolean;
  count: number;
  predictions: Prediction[];
}

// Options pour les formulaires
export const TYPES_BIEN = [
  "Appartement", "Bungalow", "Chalet", "Duplex", "Ferme",
  "Immeuble", "Maison coloniale", "Maison d'hôtes", "Maison de ville",
  "Maison écologique", "Maison en briques", "Maison en bois",
  "Maison en terre", "Maison flottante", "Maison jumelée",
  "Maison moderne", "Maison traditionnelle", "Penthouse",
  "Studio", "Terrain", "Villa", "Villa moderne",
];

export const ETATS_BIEN = ["Ancien", "À rénover", "Neuf", "Rénové", "Très bon état"];

export const REGIONS = [
  "Alaotra-Mangoro", "Amoron'i Mania", "Analamanga", "Analanjirofo",
  "Androy", "Anosy", "Atsimo-Andrefana", "Atsimo-Atsinanana",
  "Atsinanana", "Betsiboka", "Boeny", "Bongolava", "Diana",
  "Haute Matsiatra", "Ihorombe", "Itasy", "Melaky", "Menabe",
  "SAVA", "Sofia", "Vakinankaratra", "Vatovavy", "Vatovavy-Fitovinany",
];

export const QUARTIERS = [
  "Banlieue", "Centre-ville", "Quartier administratif",
  "Quartier chic", "Quartier côtier", "Quartier commerçant",
  "Quartier diplomatique", "Quartier en développement",
  "Quartier forestier", "Quartier historique", "Quartier industriel",
  "Quartier minier", "Quartier périphérique", "Quartier populaire",
  "Quartier portuaire", "Quartier résidentielle", "Quartier touristique",
  "Quartier universitaire", "Zone agricole", "Zone rurale",
];

export const ACCESSIBILITES = [
  "Chemin de terre", "Piste", "Route goudronnée",
  "Route nationale", "Zone enclavée",
];

export const POSITIONS = ["Extérieure", "Intérieure", "Partagée"];
export const OUI_NON = ["Non", "Oui"];
export const RACCORDE = ["Non raccordé", "Raccordé"];