import { useState, useEffect, useCallback } from 'react';
import { Prediction, PredictionInput, PredictionUpdate } from '../types';
import { predictionService } from '../services/prediction.service';

export const usePredictions = () => {
  // ✅ On initialise isLoading à true directement
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  // Fonction interne pour charger les données (ne gère pas le isLoading initial)
  const loadPredictions = useCallback(async () => {
    setError(null);
    try {
      const response = await predictionService.getAll();
      setPredictions(response.predictions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des prédictions');
    } finally {
      setIsLoading(false); // On passe à false à la fin
    }
  }, []);

  // ✅ Appel initial au montage SANS appeler setIsLoading(true)
  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      try {
        const response = await predictionService.getAll();
        if (isMounted) {
          setPredictions(response.predictions);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Erreur lors du chargement');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      isMounted = false; // Nettoyage pour éviter les fuites de mémoire
    };
  }, []);

  // Fonction exposée pour rafraîchir manuellement (ex: après un delete)
  const fetchPredictions = async () => {
    setIsLoading(true); // Ici c'est OK car ce n'est pas dans un useEffect
    await loadPredictions();
  };

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