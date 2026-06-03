import { useState } from "react"
import { Plus, Trash2, TrendingUp, Search, SlidersHorizontal } from "lucide-react"
import { Navbar } from "@/components/layout"
import { Button } from "@/components/ui"
import usePredictions from "@/hooks/usePredictions"
import PredictionCard from "./PredictionCard"
import PredictionModal from "./PredictionModal"
import { PredictionInput } from "@/types"

const PredictionsPage = () => {
  const {
    predictions,
    loading,
    fetching,
    handlePredict,
    handleUpdate,
    handleDeleteOne,
    handleDeleteAll,
  } = usePredictions()

  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState("")

  // ── Filtrage local par label, type_bien, region (PROTÉGÉ contre les null/undefined)
  const filtered = (predictions ?? []).filter((p) => {
    const q = search.toLowerCase()
    return (
      (p.type_bien ?? "").toLowerCase().includes(q) ||
      (p.region ?? "").toLowerCase().includes(q) ||
      (p.quartier ?? "").toLowerCase().includes(q) ||
      (p.label ?? "").toLowerCase().includes(q)
    )
  })

  const handleAdd = async (data: PredictionInput) => {
    await handlePredict(data, () => setAddOpen(false))
  }

  const handleUpdateCard = async (id: string, data: PredictionInput) => {
    await handleUpdate(id, data)
  }

  // ════════════════════════════════════════
  // LOADING SKELETON
  // ════════════════════════════════════════
  if (fetching) {
    const skeletonKeys = ["s1", "s2", "s3", "s4"]
    const smallBoxes = ["b1", "b2", "b3", "b4"]

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {skeletonKeys.map((k) => (
              <div key={k} className="card shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-20 bg-gray-100 rounded-xl mb-4" />
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {smallBoxes.map((s) => (
                    <div key={s} className="h-12 bg-gray-100 rounded-lg" />
                  ))}
                </div>
                <div className="h-8 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Sécurité : s'assurer que predictions est bien un tableau
  const safePredictions = predictions ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header page */}
        <div className="flex flex-col sm:flex-row sm:items-center
                        sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mes prédictions
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {safePredictions.length} prédiction
              {safePredictions.length > 1 ? "s" : ""} enregistrée
              {safePredictions.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Actions header */}
          <div className="flex items-center gap-3">
            {safePredictions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteAll}
                disabled={loading}
                className="text-red-500 hover:bg-red-50
                           hover:text-red-600 border border-red-200"
              >
                <Trash2 size={15} />
                Tout supprimer
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={() => setAddOpen(true)}
              disabled={loading}
            >
              <Plus size={18} />
              Nouvelle prédiction
            </Button>
          </div>
        </div>

        {/* ── Barre de recherche */}
        {safePredictions.length > 0 && (
          <div className="relative mb-6">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2
                         text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par type, région, quartier ou label..."
              className="input-field pl-9 max-w-md"
            />
            {search && (
              <p className="text-xs text-gray-500 mt-2">
                {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            ÉTAT VIDE
        ════════════════════════════════════════ */}
        {safePredictions.length === 0 && (
          <div className="flex flex-col items-center justify-center
                          py-24 text-center">
            <div className="w-20 h-20 bg-primary-50 rounded-full
                            flex items-center justify-center mb-6">
              <TrendingUp size={36} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Aucune prédiction
            </h2>
            <p className="text-gray-500 text-sm mb-8 max-w-sm">
              Commencez par créer votre première prédiction de prix
              immobilier à Madagascar.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setAddOpen(true)}
            >
              <Plus size={20} />
              Créer une prédiction
            </Button>
          </div>
        )}

        {/* ════════════════════════════════════════
            RÉSULTAT RECHERCHE VIDE
        ════════════════════════════════════════ */}
        {safePredictions.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center
                          py-16 text-center">
            <SlidersHorizontal size={40} className="text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">
              Aucun résultat pour "<strong>{search}</strong>"
            </p>
            <button
              onClick={() => setSearch("")}
              className="text-primary-600 text-sm mt-2 hover:underline"
            >
              Effacer la recherche
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════
            GRILLE 2 COLONNES
        ════════════════════════════════════════ */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filtered.map((prediction) => (
              <PredictionCard
                key={prediction.id}
                prediction={prediction}
                onUpdate={handleUpdateCard}
                onDelete={handleDeleteOne}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ajout */}
      <PredictionModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        prediction={null}
        loading={loading}
      />
    </div>
  )
}

export default PredictionsPage