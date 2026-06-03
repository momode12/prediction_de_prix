import { useState } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { PredictionInput, Prediction } from "@/types";

const OPTIONS = {
  type_bien: [
    "Appartement",
    "Bungalow",
    "Chalet",
    "Duplex",
    "Ferme",
    "Immeuble",
    "Maison",
    "Maison coloniale",
    "Maison d'hôtes",
    "Maison de ville",
    "Maison en bois",
    "Maison en briques",
    "Maison en terre",
    "Maison flottante",
    "Maison jumelée",
    "Maison moderne",
    "Maison traditionnelle",
    "Maison écologique",
    "Penthouse",
    "Studio",
    "Terrain",
    "Villa",
  ],
  etat_bien: ["Ancien", "En construction", "Neuf", "Rénové", "À rénover"],
  region: [
    "Alaotra-Mangoro",
    "Amoron'i Mania",
    "Analamanga",
    "Analanjirofo",
    "Androy",
    "Anosy",
    "Atsimo-Andrefana",
    "Atsimo-Atsinanana",
    "Atsinanana",
    "Betsiboka",
    "Boeny",
    "Bongolava",
    "Diana",
    "Fitovinany",
    "Haute Matsiatra",
    "Ihorombe",
    "Itasy",
    "Mangoky",
    "Melaky",
    "Menabe",
    "Sava",
    "Sofia",
    "Vakinankaratra",
    "Vatovavy",
  ],
  quartier: [
    "Banlieue",
    "Centre-ville",
    "Quartier administratif",
    "Quartier chic",
    "Quartier commerçant",
    "Quartier côtier",
    "Quartier diplomatique",
    "Quartier en développement",
    "Quartier forestier",
    "Quartier historique",
    "Quartier minier",
    "Quartier populaire",
    "Quartier périphérique",
    "Quartier touristique",
    "Quartier universitaire",
    "Zone agricole",
    "Zone industrielle",
    "Zone portuaire",
    "Zone rurale",
    "Zone résidentielle",
  ],
  accessibilite: [
    "Proche aéroport",
    "Proche gare routière",
    "Proche port",
    "Route en terre",
    "Route goudronnée",
  ],
  douche_position: ["Aucune", "Extérieure", "Intérieure"],
  wc_position: ["Aucun", "Extérieur", "Intérieur"],
  garage: ["Non", "Oui"],
  jardin: ["Non", "Oui"],
  electricite: ["Non raccordé", "Raccordé"],
  eau_courante: ["Non raccordée", "Raccordée"],
};

const defaultForm: PredictionInput = {
  type_bien: "Villa",
  surface_m2: 100,
  nb_chambres: 3,
  nombre_etages: 1,
  annee_construction: 2000,
  etat_bien: "Neuf",
  region: "Analamanga",
  quartier: "Centre-ville",
  prix_terrain_m2: 100000,
  accessibilite: "Route goudronnée",
  douche_position: "Intérieure",
  wc_position: "Intérieur",
  garage: "Non",
  jardin: "Non",
  electricite: "Raccordé",
  eau_courante: "Raccordée",
  label: "",
};

interface PredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PredictionInput) => Promise<void>;
  prediction?: Prediction | null;
  loading: boolean;
}

const SelectField = ({
  label,
  name,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}) => (
  <div>
    <label className="label">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="input-field bg-white"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// ── Formulaire isolé — reçoit initialValues, pas de useEffect
const PredictionForm = ({
  initialValues,
  isEdit,
  onClose,
  onSubmit,
  loading,
}: {
  initialValues: PredictionInput;
  isEdit: boolean;
  onClose: () => void;
  onSubmit: (data: PredictionInput) => Promise<void>;
  loading: boolean;
}) => {
  const [form, setForm] = useState<PredictionInput>(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof PredictionInput, string>>
  >({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const numericFields = new Set([
      "surface_m2",
      "nb_chambres",
      "nombre_etages",
      "annee_construction",
      "prix_terrain_m2",
    ]);
    setForm((prev) => ({
      ...prev,
      [name]: numericFields.has(name) ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof PredictionInput, string>> = {};
    if (!form.type_bien) e.type_bien = "Obligatoire.";
    if (!form.surface_m2 || form.surface_m2 < 10)
      e.surface_m2 = "Surface min. 10 m².";
    if (form.nb_chambres < 0) e.nb_chambres = "Valeur invalide.";
    if (form.nombre_etages < 0) e.nombre_etages = "Valeur invalide.";
    if (!form.annee_construction || form.annee_construction < 1900)
      e.annee_construction = "Année invalide.";
    if (!form.prix_terrain_m2 || form.prix_terrain_m2 < 1000)
      e.prix_terrain_m2 = "Prix min. 1000 Ar/m².";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-6">
        <div className="bg-primary-50 rounded-xl p-4">
          <Input
            id="label"
            name="label"
            label="Label (optionnel)"
            value={form.label ?? ""}
            onChange={handleChange}
            placeholder="Ex: Ma villa Analamanga"
            disabled={loading}
          />
        </div>

        {/* BLOC 1 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center">
              1
            </span>
            <span>Informations du bien</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Type de bien"
              name="type_bien"
              value={form.type_bien}
              options={OPTIONS.type_bien}
              onChange={handleChange}
              disabled={loading}
            />
            <SelectField
              label="État du bien"
              name="etat_bien"
              value={form.etat_bien}
              options={OPTIONS.etat_bien}
              onChange={handleChange}
              disabled={loading}
            />
            <Input
              id="surface_m2"
              name="surface_m2"
              label="Surface (m²)"
              type="number"
              value={form.surface_m2}
              onChange={handleChange}
              min={10}
              disabled={loading}
              error={errors.surface_m2}
            />
            <Input
              id="nb_chambres"
              name="nb_chambres"
              label="Nombre de chambres"
              type="number"
              value={form.nb_chambres}
              onChange={handleChange}
              min={0}
              disabled={loading}
              error={errors.nb_chambres}
            />
            <Input
              id="nombre_etages"
              name="nombre_etages"
              label="Nombre d'étages"
              type="number"
              value={form.nombre_etages}
              onChange={handleChange}
              min={0}
              disabled={loading}
              error={errors.nombre_etages}
            />
            <Input
              id="annee_construction"
              name="annee_construction"
              label="Année de construction"
              type="number"
              value={form.annee_construction}
              onChange={handleChange}
              min={1900}
              max={2026}
              disabled={loading}
              error={errors.annee_construction}
            />
          </div>
        </div>

        {/* BLOC 2 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center">
              2
            </span>
            <span>Localisation</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Région"
              name="region"
              value={form.region}
              options={OPTIONS.region}
              onChange={handleChange}
              disabled={loading}
            />
            <SelectField
              label="Quartier"
              name="quartier"
              value={form.quartier}
              options={OPTIONS.quartier}
              onChange={handleChange}
              disabled={loading}
            />
            <SelectField
              label="Accessibilité"
              name="accessibilite"
              value={form.accessibilite}
              options={OPTIONS.accessibilite}
              onChange={handleChange}
              disabled={loading}
            />
            <Input
              id="prix_terrain_m2"
              name="prix_terrain_m2"
              label="Prix terrain (Ar/m²)"
              type="number"
              value={form.prix_terrain_m2}
              onChange={handleChange}
              min={1000}
              disabled={loading}
              error={errors.prix_terrain_m2}
            />
          </div>
        </div>

        {/* BLOC 3 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center">
              3
            </span>
            <span>Équipements</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Position douche"
              name="douche_position"
              value={form.douche_position}
              options={OPTIONS.douche_position}
              onChange={handleChange}
              disabled={loading}
            />
            <SelectField
              label="Position WC"
              name="wc_position"
              value={form.wc_position}
              options={OPTIONS.wc_position}
              onChange={handleChange}
              disabled={loading}
            />
            <SelectField
              label="Électricité"
              name="electricite"
              value={form.electricite}
              options={OPTIONS.electricite}
              onChange={handleChange}
              disabled={loading}
            />
            <SelectField
              label="Eau courante"
              name="eau_courante"
              value={form.eau_courante}
              options={OPTIONS.eau_courante}
              onChange={handleChange}
              disabled={loading}
            />{" "}
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            {isEdit ? "Enregistrer les modifications" : "Lancer la prédiction"}
          </Button>
        </div>
      </div>
    </form>
  );
};

// ── Modal wrapper — utilise `key` pour forcer le reset du form
const PredictionModal = ({
  isOpen,
  onClose,
  onSubmit,
  prediction,
  loading,
}: PredictionModalProps) => {
  const isEdit = !!prediction;

  const initialValues: PredictionInput = prediction
    ? {
        type_bien: prediction.type_bien,
        surface_m2: prediction.surface_m2,
        nb_chambres: prediction.nb_chambres,
        nombre_etages: prediction.nombre_etages,
        annee_construction: prediction.annee_construction,
        etat_bien: prediction.etat_bien,
        region: prediction.region,
        quartier: prediction.quartier,
        prix_terrain_m2: prediction.prix_terrain_m2,
        accessibilite: prediction.accessibilite,
        douche_position: prediction.douche_position,
        wc_position: prediction.wc_position,
        garage: prediction.garage,
        jardin: prediction.jardin,
        electricite: prediction.electricite,
        eau_courante: prediction.eau_courante,
        label: prediction.label ?? "",
      }
    : defaultForm;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier la prédiction" : "Nouvelle prédiction"}
      size="xl"
    >
      {/* key force le remontage complet de PredictionForm quand prediction ou isOpen change */}
      <PredictionForm
        key={prediction?.id ?? `new-${isOpen}`}
        initialValues={initialValues}
        isEdit={isEdit}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={loading}
      />
    </Modal>
  );
};

export default PredictionModal;
