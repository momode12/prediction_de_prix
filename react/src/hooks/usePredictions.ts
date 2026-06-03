import { useState, useEffect, useCallback } from "react"
import Swal from "sweetalert2"
import { Prediction, PredictionInput, PredictionUpdatePayload } from "@/types"
import PredictionService from "@/services/prediction.service"

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})

const usePredictions = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const fetchAll = useCallback(async () => {
    console.log("fetchAll start")
    setFetching(true)
    try {
      const data = await PredictionService.getAll()
      console.log("fetchAll data →", data)
      const list = Array.isArray(data?.predictions) ? data.predictions : []
      setPredictions(list)
    } catch (err) {
      console.error("fetchAll error →", err)
      setPredictions([])
      Toast.fire({ icon: "error", title: "Erreur lors du chargement." })
    } finally {
      console.log("fetchAll finally → setFetching(false)")
      setFetching(false)
    }
  }, [])

 useEffect(() => {
  fetchAll()
}, []) // ← tableau vide, un seul appel

  // ── NOUVELLE PRÉDICTION
  const handlePredict = async (
    payload: PredictionInput,
    onSuccess?: () => void
  ) => {
    setLoading(true)
    try {
      const data = await PredictionService.predict(payload)
      setPredictions((prev) => [data.prediction, ...prev])
      Toast.fire({ icon: "success", title: "Prédiction enregistrée !" })
      onSuccess?.()
    } catch (error: any) {
      const msg =
        error?.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(" ")
          : error?.response?.data?.message ?? "Erreur lors de la prédiction."
      Toast.fire({ icon: "error", title: String(msg) })
    } finally {
      setLoading(false)
    }
  }

  // ── MODIFIER
  const handleUpdate = async (
    id: string,
    payload: PredictionUpdatePayload,
    onSuccess?: () => void
  ) => {
    setLoading(true)
    try {
      const data = await PredictionService.update(id, payload)
      setPredictions((prev) =>
        prev.map((p) => (p.id === id ? data.prediction : p))
      )
      Toast.fire({ icon: "success", title: "Prédiction mise à jour !" })
      onSuccess?.()
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ?? "Erreur lors de la mise à jour."
      Toast.fire({ icon: "error", title: msg })
    } finally {
      setLoading(false)
    }
  }

  // ── SUPPRIMER UNE
  const handleDeleteOne = async (id: string) => {
    const result = await Swal.fire({
      title: "Supprimer cette prédiction ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      confirmButtonText: "Oui, supprimer",
      confirmButtonColor: "#dc2626",
      showCancelButton: true,
      cancelButtonText: "Annuler",
    })
    if (!result.isConfirmed) return

    setLoading(true)
    try {
      await PredictionService.deleteOne(id)
      setPredictions((prev) => prev.filter((p) => p.id !== id))
      Toast.fire({ icon: "success", title: "Prédiction supprimée." })
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ?? "Erreur lors de la suppression."
      Toast.fire({ icon: "error", title: msg })
    } finally {
      setLoading(false)
    }
  }

  // ── SUPPRIMER TOUTES
  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: "Tout supprimer ?",
      text: "Toutes vos prédictions seront supprimées définitivement.",
      icon: "warning",
      confirmButtonText: "Oui, tout supprimer",
      confirmButtonColor: "#dc2626",
      showCancelButton: true,
      cancelButtonText: "Annuler",
    })
    if (!result.isConfirmed) return

    setLoading(true)
    try {
      await PredictionService.deleteAll()
      setPredictions([])
      Toast.fire({ icon: "success", title: "Toutes les prédictions supprimées." })
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ?? "Erreur lors de la suppression."
      Toast.fire({ icon: "error", title: msg })
    } finally {
      setLoading(false)
    }
  }

  return {
    predictions,
    loading,
    fetching,
    handlePredict,
    handleUpdate,
    handleDeleteOne,
    handleDeleteAll,
    fetchAll,
  }
}

export default usePredictions