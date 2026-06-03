import { useState } from "react"
import {
  MapPin, Home, BedDouble, Layers,
  CalendarDays, Zap, Droplets, Car,
  Trees, Tag, Pencil, Trash2,
} from "lucide-react"
import { Prediction, PredictionInput } from "@/types"
import { Button } from "@/components/ui"
import PredictionModal from "./PredictionModal"

interface PredictionCardProps {
  prediction: Prediction
  onUpdate: (id: string, data: PredictionInput) => Promise<void>
  onDelete: (id: string) => void
  loading: boolean
}

// ── Badge helper
const Badge = ({
  label,
  color = "gray",
}: {
  label: string
  color?: "gray" | "green" | "blue" | "yellow" | "red"
}) => {
  const colors = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
  )
}

// ── État → couleur
const etatColor = (etat: string) => {
  if (etat === "Neuf") return "green"
  if (etat === "Rénové") return "blue"
  if (etat === "À rénover") return "yellow"
  if (etat === "Ancien") return "red"
  return "gray"
}

const PredictionCard = ({
  prediction,
  onUpdate,
  onDelete,
  loading,
}: PredictionCardProps) => {
  const [editOpen, setEditOpen] = useState(false)

  const handleUpdate = async (data: PredictionInput) => {
    await onUpdate(prediction.id, data)
    setEditOpen(false)
  }

  // ── Valeurs sécurisées avec fallback
  const prixMillions = prediction.prix_predit_millions ?? 0
  const prixAr = prediction.prix_predit ?? 0
  const etatBien = prediction.etat_bien ?? "Inconnu"
  const createdDate = prediction.created_at
    ? new Date(prediction.created_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date inconnue"

  return (
    <>
      <div className="card shadow-sm hover:shadow-md
                      transition-shadow duration-200 flex flex-col h-full">

        {/* ── Header carte */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {/* Label */}
            {prediction.label && (
              <div className="flex items-center gap-1.5 mb-1">
                <Tag size={12} className="text-primary-500" />
                <span className="text-xs text-primary-600 font-medium truncate">
                  {prediction.label}
                </span>
              </div>
            )}
            <h3 className="font-semibold text-gray-900 truncate">
              {prediction.type_bien ?? "Type inconnu"}
            </h3>
            <div className="flex items-center gap-1 mt-0.5 text-gray-500">
              <MapPin size={12} />
              <span className="text-xs truncate">
                {prediction.quartier ?? "—"}, {prediction.region ?? "—"}
              </span>
            </div>
          </div>
          <Badge
            label={etatBien}
            color={etatColor(etatBien)}
          />
        </div>

        {/* ── Prix prédit — mise en valeur */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700
                        rounded-xl p-4 mb-4 text-white text-center">
          <p className="text-xs text-primary-200 mb-0.5">Prix estimé</p>
          <p className="text-2xl font-bold">
            {prixMillions.toLocaleString("fr-FR", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            <span className="text-base font-medium ml-1">M Ar</span>
          </p>
          <p className="text-xs text-primary-200 mt-0.5">
            {prixAr.toLocaleString("fr-FR")} Ar
          </p>
        </div>

        {/* ── Détails en grille */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            {
              icon: <Home size={13} />,
              label: "Surface",
              value: `${prediction.surface_m2 ?? 0} m²`,
            },
            {
              icon: <BedDouble size={13} />,
              label: "Chambres",
              value: prediction.nb_chambres ?? 0,
            },
            {
              icon: <Layers size={13} />,
              label: "Étages",
              value: prediction.nombre_etages ?? 0,
            },
            {
              icon: <CalendarDays size={13} />,
              label: "Construction",
              value: prediction.annee_construction ?? "—",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-gray-50 rounded-lg px-3 py-2
                         flex items-center gap-2"
            >
              <span className="text-primary-500">{item.icon}</span>
              <div>
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-sm font-medium text-gray-800">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Équipements */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {prediction.garage === "Oui" && (
            <div className="flex items-center gap-1 bg-gray-100
                            px-2 py-1 rounded-lg">
              <Car size={11} className="text-gray-500" />
              <span className="text-xs text-gray-600">Garage</span>
            </div>
          )}
          {prediction.jardin === "Oui" && (
            <div className="flex items-center gap-1 bg-gray-100
                            px-2 py-1 rounded-lg">
              <Trees size={11} className="text-gray-500" />
              <span className="text-xs text-gray-600">Jardin</span>
            </div>
          )}
          {prediction.electricite === "Raccordé" && (
            <div className="flex items-center gap-1 bg-yellow-50
                            px-2 py-1 rounded-lg">
              <Zap size={11} className="text-yellow-500" />
              <span className="text-xs text-yellow-700">Électricité</span>
            </div>
          )}
          {prediction.eau_courante === "Raccordée" && (
            <div className="flex items-center gap-1 bg-blue-50
                            px-2 py-1 rounded-lg">
              <Droplets size={11} className="text-blue-500" />
              <span className="text-xs text-blue-700">Eau courante</span>
            </div>
          )}
        </div>

        {/* ── Footer */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3">
            {createdDate}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => setEditOpen(true)}
              disabled={loading}
            >
              <Pencil size={14} />
              Modifier
            </Button>
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={() => onDelete(prediction.id)}
              disabled={loading}
            >
              <Trash2 size={14} />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      {/* ── Modal édition */}
      <PredictionModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
        prediction={prediction}
        loading={loading}
      />
    </>
  )
}

export default PredictionCard