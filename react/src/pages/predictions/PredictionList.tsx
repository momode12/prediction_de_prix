import React from 'react';
import { usePredictions } from '../../hooks/usePredictions';
import { PredictionCard } from './PredictionCard';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import styles from './PredictionList.module.scss';

export const PredictionList: React.FC = () => {
  const { predictions, isLoading, error, deleteAllPredictions } = usePredictions();

  const handleDeleteAll = async () => {
    if (globalThis.confirm('Supprimer TOUT l\'historique ?')) {
      await deleteAllPredictions();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center">Chargement de l'historique...</p>;
    }

    if (predictions.length === 0) {
      return (
        <div className={styles.empty}>
          <p>Aucune prédiction enregistrée.</p>
        </div>
      );
    }

    return (
      <div>
        {predictions.map((prediction) => (
          <PredictionCard
            key={prediction.id}
            prediction={prediction}
            onUpdate={() => {}}
            onDelete={() => {}}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>📜 Historique des Prédictions</h2>
        {predictions.length > 0 && (
          <Button variant="danger" onClick={handleDeleteAll}>Tout supprimer</Button>
        )}
      </div>

      {error && <Alert type="error" message={error} />}

      {renderContent()}
    </div>
  );
};