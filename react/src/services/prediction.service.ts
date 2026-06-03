import api from "@/lib/api"
import {
  PredictionInput,
  PredictionUpdatePayload,
  PredictionListResponse,
  PredictionSingleResponse,
} from "@/types"

const PredictionService = {

  // ════════════════════════════════════════
  // NOUVELLE PRÉDICTION
  // ════════════════════════════════════════
  predict: async (
    payload: PredictionInput
  ): Promise<PredictionSingleResponse> => {
    const { data } = await api.post<PredictionSingleResponse>(
      "/api/predict",
      payload
    )
    return data
  },

  // ════════════════════════════════════════
  // HISTORIQUE COMPLET
  // ════════════════════════════════════════
  getAll: async (): Promise<PredictionListResponse> => {
    const { data } = await api.get<PredictionListResponse>(
      "/api/predictions"
    )
    return data
  },

  // ════════════════════════════════════════
  // UNE PRÉDICTION
  // ════════════════════════════════════════
  getOne: async (id: string): Promise<PredictionSingleResponse> => {
    const { data } = await api.get<PredictionSingleResponse>(
      `/api/predictions/${id}`
    )
    return data
  },

  // ════════════════════════════════════════
  // MODIFIER UNE PRÉDICTION
  // ════════════════════════════════════════
  update: async (
    id: string,
    payload: PredictionUpdatePayload
  ): Promise<PredictionSingleResponse> => {
    const { data } = await api.patch<PredictionSingleResponse>(
      `/api/predictions/${id}`,
      payload
    )
    return data
  },

  // ════════════════════════════════════════
  // SUPPRIMER UNE PRÉDICTION
  // ════════════════════════════════════════
  deleteOne: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/predictions/${id}`
    )
    return data
  },

  // ════════════════════════════════════════
  // SUPPRIMER TOUTES LES PRÉDICTIONS
  // ════════════════════════════════════════
  deleteAll: async (): Promise<{ message: string }> => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      "/api/predictions"
    )
    return data
  },
}

export default PredictionService