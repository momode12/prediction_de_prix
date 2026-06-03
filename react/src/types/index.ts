// ════════════════════════════════════════
// USER
// ════════════════════════════════════════
export interface User {
  id: string
  username: string
  email: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

// ════════════════════════════════════════
// AUTH
// ════════════════════════════════════════
export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface UpdateProfilePayload {
  username?: string
  email?: string
}

export interface ChangePasswordPayload {
  old_password: string
  new_password: string
}

export interface AuthResponse {
  success: boolean
  access_token: string
  refresh_token: string
  user: User
}

export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse {
  success: boolean
  message: string
  user_id: string
}

// ════════════════════════════════════════
// PREDICTION
// ════════════════════════════════════════
export interface PredictionInput {
  type_bien: string
  surface_m2: number
  nb_chambres: number
  nombre_etages: number
  annee_construction: number
  etat_bien: string
  region: string
  quartier: string
  prix_terrain_m2: number
  accessibilite: string
  douche_position: string
  wc_position: string
  garage: string
  jardin: string
  electricite: string
  eau_courante: string
  label?: string
}

export interface PredictionUpdatePayload {
  label?: string
  type_bien?: string
  surface_m2?: number
  nb_chambres?: number
  nombre_etages?: number
  annee_construction?: number
  etat_bien?: string
  region?: string
  quartier?: string
  prix_terrain_m2?: number
  accessibilite?: string
  douche_position?: string
  wc_position?: string
  garage?: string
  jardin?: string
  electricite?: string
  eau_courante?: string
}

export interface Prediction {
  id: string
  user_id: string
  label: string | null
  type_bien: string
  surface_m2: number
  nb_chambres: number
  nombre_etages: number
  annee_construction: number
  etat_bien: string
  region: string
  quartier: string
  prix_terrain_m2: number
  accessibilite: string
  douche_position: string
  wc_position: string
  garage: string
  jardin: string
  electricite: string
  eau_courante: string
  prix_predit: number
  prix_predit_millions: number
  created_at: string
  updated_at: string
}

// ════════════════════════════════════════
// API RESPONSES GENERIQUES
// ════════════════════════════════════════
export interface ApiSuccess<T = unknown> {
  success: true
  data?: T
  message?: string
}

export interface ApiError {
  success: false
  message?: string
  errors?: Record<string, string[]>
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

export interface PredictionListResponse {
  success: boolean
  count: number
  predictions: Prediction[]
}

export interface PredictionSingleResponse {
  success: boolean
  prediction: Prediction
}

export interface ProfileResponse {
  success: boolean
  user: User
}

// ════════════════════════════════════════
// FORM ERRORS
// ════════════════════════════════════════
export type FormErrors<T> = Partial<Record<keyof T, string>>

// ════════════════════════════════════════
// TOKEN STORAGE KEYS
// ════════════════════════════════════════
export const TOKEN_KEYS = {
  ACCESS: "access_token",
  REFRESH: "refresh_token",
  USER: "user",
} as const