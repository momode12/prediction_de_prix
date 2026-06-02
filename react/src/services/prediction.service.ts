import api from '../lib/api';
import type {
  Prediction,
  PredictionInput,
  PredictionUpdate,
  PredictionsResponse,
  ApiResponse,
} from '../types';

export const predictionService = {
  // Créer une nouvelle prédiction
  async create(data: PredictionInput): Promise<{ prediction: Prediction }> {
    const response = await api.post('/api/predict', data);
    return response.data;
  },

  // Obtenir toutes les prédictions de l'utilisateur
  async getAll(): Promise<PredictionsResponse> {
    const response = await api.get('/api/predictions');
    return response.data;
  },

  // Obtenir une prédiction par ID
  async getById(id: string): Promise<{ prediction: Prediction }> {
    const response = await api.get(`/api/predictions/${id}`);
    return response.data;
  },

  // Modifier une prédiction (label et/ou inputs pour recalcul)
  async update(id: string, data: PredictionUpdate): Promise<{ prediction: Prediction }> {
    const response = await api.patch(`/api/predictions/${id}`, data);
    return response.data;
  },

  // Supprimer une prédiction
  async delete(id: string): Promise<ApiResponse> {
    const response = await api.delete(`/api/predictions/${id}`);
    return response.data;
  },

  // Supprimer toutes les prédictions
  async deleteAll(): Promise<ApiResponse> {
    const response = await api.delete('/api/predictions');
    return response.data;
  },
};