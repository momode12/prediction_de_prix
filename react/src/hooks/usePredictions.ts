import { useState, useEffect, useCallback } from 'react';
import type { Prediction, PredictionInput, PredictionUpdate } from '../types';
import { predictionService } from '../services/prediction.service';

export const usePredictions = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les prédictions
  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await predictionService.getAll();
      setPredictions(response.predictions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des prédictions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Créer une nouvelle prédiction
  const createPrediction = async (data: PredictionInput): Promise<Prediction | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await predictionService.create(data);
      setPredictions(prev => [response.prediction, ...prev]);
      return response.prediction;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier une prédiction
  const updatePrediction = async (id: string, data: PredictionUpdate): Promise<Prediction | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await predictionService.update(id, data);
      setPredictions(prev => prev.map(p => p.id === id ? response.prediction : p));
      return response.prediction;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer une prédiction
  const deletePrediction = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await predictionService.delete(id);
      setPredictions(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer toutes les prédictions
  const deleteAllPredictions = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await predictionService.deleteAll();
      setPredictions([]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Charger automatiquement au montage
  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return {
    predictions,
    isLoading,
    error,
    fetchPredictions,
    createPrediction,
    updatePrediction,
    deletePrediction,
    deleteAllPredictions,
  };
};