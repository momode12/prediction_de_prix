import React, { useState } from 'react';
import { usePredictions } from '../../hooks/usePredictions';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { 
  TYPES_BIEN, ETATS_BIEN, REGIONS, QUARTIERS, ACCESSIBILITES, POSITIONS, OUI_NON, RACCORDE 
} from '../../types';
import styles from './PredictForm.module.scss';

export const PredictForm: React.FC = () => {
  const { createPrediction, isLoading, error } = usePredictions();
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    type_bien: '', surface_m2: '', nb_chambres: '', nombre_etages: '',
    annee_construction: '', etat_bien: '', region: '', quartier: '',
    prix_terrain_m2: '', accessibilite: '', douche_position: '',
    wc_position: '', garage: '', jardin: '', electricite: '', eau_courante: '', label: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    
    // Conversion des champs numériques
    const payload = {
      ...formData,
      surface_m2: Number(formData.surface_m2),
      nb_chambres: Number(formData.nb_chambres),
      nombre_etages: Number(formData.nombre_etages),
      annee_construction: Number(formData.annee_construction),
      prix_terrain_m2: Number(formData.prix_terrain_m2),
    };

    const result = await createPrediction(payload);
    if (result) {
      setSuccess(`Prédiction réussie ! Prix estimé : ${result.prix_predit_millions} millions Ar`);
      // Reset partiel du formulaire
      setFormData(prev => ({ ...prev, label: '' }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>🏠 Nouvelle Estimation</h2>
        {success && <Alert type="success" message={success} />}
        {error && <Alert type="error" message={error} />}
        
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <Input label="Label (optionnel)" name="label" value={formData.label} onChange={handleChange} placeholder="Ex: Ma villa à Tana" />
          
          <Input as="select" label="Type de bien" name="type_bien" value={formData.type_bien} onChange={handleChange} options={TYPES_BIEN.map(v => ({value: v, label: v}))} required />
          <Input as="select" label="État du bien" name="etat_bien" value={formData.etat_bien} onChange={handleChange} options={ETATS_BIEN.map(v => ({value: v, label: v}))} required />
          
          <Input label="Surface (m²)" name="surface_m2" type="number" value={formData.surface_m2} onChange={handleChange} required min={10} />
          <Input label="Nombre de chambres" name="nb_chambres" type="number" value={formData.nb_chambres} onChange={handleChange} required min={0} />
          <Input label="Nombre d'étages" name="nombre_etages" type="number" value={formData.nombre_etages} onChange={handleChange} required min={0} />
          <Input label="Année de construction" name="annee_construction" type="number" value={formData.annee_construction} onChange={handleChange} required min={1900} max={2026} />
          
          <Input as="select" label="Région" name="region" value={formData.region} onChange={handleChange} options={REGIONS.map(v => ({value: v, label: v}))} required />
          <Input as="select" label="Quartier" name="quartier" value={formData.quartier} onChange={handleChange} options={QUARTIERS.map(v => ({value: v, label: v}))} required />
          
          <Input label="Prix du terrain au m² (Ar)" name="prix_terrain_m2" type="number" value={formData.prix_terrain_m2} onChange={handleChange} required min={1000} />
          <Input as="select" label="Accessibilité" name="accessibilite" value={formData.accessibilite} onChange={handleChange} options={ACCESSIBILITES.map(v => ({value: v, label: v}))} required />
          
          <Input as="select" label="Position douche" name="douche_position" value={formData.douche_position} onChange={handleChange} options={POSITIONS.map(v => ({value: v, label: v}))} required />
          <Input as="select" label="Position WC" name="wc_position" value={formData.wc_position} onChange={handleChange} options={POSITIONS.map(v => ({value: v, label: v}))} required />
          
          <Input as="select" label="Garage" name="garage" value={formData.garage} onChange={handleChange} options={OUI_NON.map(v => ({value: v, label: v}))} required />
          <Input as="select" label="Jardin" name="jardin" value={formData.jardin} onChange={handleChange} options={OUI_NON.map(v => ({value: v, label: v}))} required />
          <Input as="select" label="Électricité" name="electricite" value={formData.electricite} onChange={handleChange} options={RACCORDE.map(v => ({value: v, label: v}))} required />
          <Input as="select" label="Eau courante" name="eau_courante" value={formData.eau_courante} onChange={handleChange} options={RACCORDE.map(v => ({value: v, label: v}))} required />

          <div className={styles.fullWidth}>
            <Button type="submit" isLoading={isLoading} className={styles.submitBtn}>Lancer la prédiction</Button>
          </div>
        </form>
      </div>
    </div>
  );
};