import React, { useState } from 'react';
import { Prediction } from '../../types';
import { predictionService } from '../../services/prediction.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './PredictionCard.module.scss';

interface Props {
  prediction: Prediction;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

export const PredictionCard: React.FC<Props> = ({ prediction, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(prediction.label || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await predictionService.update(prediction.id, { label });
      onUpdate();
      setIsEditing(false);
    } catch {
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.type}>{prediction.type_bien}</span>
        <span className={styles.price}>{prediction.prix_predit_millions} M Ar</span>
      </div>
      
      {isEditing ? (
        <div className={styles.editMode}>
          <Input label="Modifier le nom" value={label} onChange={e => setLabel(e.target.value)} />
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isLoading}>Annuler</Button>
            <Button onClick={handleSave} isLoading={isLoading}>Sauvegarder</Button>
          </div>
        </div>
      ) : (
        <div className={styles.viewMode}>
          <p>{prediction.label}</p>
        </div>
      )}
    </div>
  );
};