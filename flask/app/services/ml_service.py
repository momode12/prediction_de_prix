import os
import numpy as np
import pandas as pd
import joblib
from flask import current_app
from app.models.ml_prediction import MLPrediction
from app.models.user import User


class MLService:
    # ── Chargement lazy des pkl (une seule fois au premier appel)
    _model = None
    _encoders = None
    _scaler = None
    _features = None

    @classmethod
    def _load(cls):
        """Charge les fichiers pkl si pas encore en mémoire."""
        if cls._model is None:
            cls._model = joblib.load(current_app.config["ML_MODEL_PATH"])
            cls._encoders = joblib.load(current_app.config["ML_ENCODERS_PATH"])
            cls._scaler = joblib.load(current_app.config["ML_SCALER_PATH"])
            cls._features = joblib.load(current_app.config["ML_FEATURES_PATH"])

    # ────────────────────────────────
    # PRÉDICTION
    # ────────────────────────────────


    @classmethod
    def predict(cls, user_id: str, input_data: dict) -> MLPrediction:
        cls._load()

        user = User.objects(id=user_id, is_active=True).first()
        if not user:
            raise ValueError("Utilisateur introuvable.")

        try:  # ← ajouter ce try/except
            mapping = {
                "type_bien": "Type_bien",
                "etat_bien": "Etat_bien",
                "region": "Region",
                "quartier": "Quartier",
                "accessibilite": "Accessibilite",
                "douche_position": "Douche_position",
                "wc_position": "WC_position",
                "garage": "Garage",
                "jardin": "Jardin",
                "electricite": "Electricite",
                "eau_courante": "Eau_courante",
            }

            row = {
                "Surface_m2": input_data["surface_m2"],
                "Nb_chambres": input_data["nb_chambres"],
                "Nombre_etages": input_data["nombre_etages"],
                "Annee_construction": input_data["annee_construction"],
                "Prix_terrain_m2": input_data["prix_terrain_m2"],
            }

            for key_schema, key_notebook in mapping.items():
                val = input_data[key_schema]
                encoder = cls._encoders.get(key_notebook)
                if encoder is None:
                    raise ValueError(f"Encodeur manquant pour {key_notebook}")
                try:
                    row[key_notebook + "_enc"] = int(encoder.transform([val])[0])
                except ValueError:
                    raise ValueError(f"Valeur inconnue '{val}' pour {key_notebook}")

            X_input = pd.DataFrame([row])[cls._features]
            X_scaled = cls._scaler.transform(X_input)
            prix_log = cls._model.predict(X_scaled)[0]
            prix_reel = int(np.exp(prix_log))

        except Exception as e:
            import traceback
            print("=== ERREUR ML ===")
            print(traceback.format_exc())  # ← affiche l'erreur exacte dans le terminal
            raise e

        prediction = MLPrediction(
            user=user,
            label=input_data.get("label"),
            type_bien=input_data["type_bien"],
            surface_m2=input_data["surface_m2"],
            nb_chambres=input_data["nb_chambres"],
            nombre_etages=input_data["nombre_etages"],
            annee_construction=input_data["annee_construction"],
            etat_bien=input_data["etat_bien"],
            region=input_data["region"],
            quartier=input_data["quartier"],
            prix_terrain_m2=input_data["prix_terrain_m2"],
            accessibilite=input_data["accessibilite"],
            douche_position=input_data["douche_position"],
            wc_position=input_data["wc_position"],
            garage=input_data["garage"],
            jardin=input_data["jardin"],
            electricite=input_data["electricite"],
            eau_courante=input_data["eau_courante"],
            prix_predit=prix_reel,
        )
        prediction.save()
        return prediction
    # ────────────────────────────────
    # CRUD PRÉDICTIONS
    # ────────────────────────────────

    # ── GET toutes les prédictions d'un user
    @staticmethod
    def get_history(user_id: str) -> list:
        user = User.objects(id=user_id).first()
        if not user:
            raise ValueError("Utilisateur introuvable.")
        return MLPrediction.objects(user=user).order_by("-created_at").all()

    # ── GET une prédiction par id
    @staticmethod
    def get_one(user_id: str, prediction_id: str) -> MLPrediction:
        user = User.objects(id=user_id).first()
        if not user:
            raise ValueError("Utilisateur introuvable.")
        pred = MLPrediction.objects(id=prediction_id, user=user).first()
        if not pred:
            raise ValueError("Prédiction introuvable.")
        return pred

    # ── UPDATE une prédiction (label et/ou recalcul si inputs changés)
    @classmethod
    def update_prediction(cls, user_id: str, prediction_id: str, data: dict) -> MLPrediction:
        pred = MLService.get_one(user_id, prediction_id)

        # Champs inputs ML
        input_keys = [
            "type_bien", "surface_m2", "nb_chambres", "nombre_etages",
            "annee_construction", "etat_bien", "region", "quartier",
            "prix_terrain_m2", "accessibilite", "douche_position",
            "wc_position", "garage", "jardin", "electricite", "eau_courante",
        ]
        need_recalcul = any(k in data for k in input_keys)

        # Mise à jour des champs
        for key in input_keys:
            if key in data:
                setattr(pred, key, data[key])
        if "label" in data:
            pred.label = data["label"]

        # Recalcul du prix si un input a changé
        if need_recalcul:
            cls._load()
            current_inputs = {k: getattr(pred, k) for k in input_keys}
            mapping = {
                "type_bien": "Type_bien", "etat_bien": "Etat_bien",
                "region": "Region", "quartier": "Quartier",
                "accessibilite": "Accessibilite", "douche_position": "Douche_position",
                "wc_position": "WC_position", "garage": "Garage",
                "jardin": "Jardin", "electricite": "Electricite",
                "eau_courante": "Eau_courante",
            }
            row = {
                "Surface_m2": current_inputs["surface_m2"],
                "Nb_chambres": current_inputs["nb_chambres"],
                "Nombre_etages": current_inputs["nombre_etages"],
                "Annee_construction": current_inputs["annee_construction"],
                "Prix_terrain_m2": current_inputs["prix_terrain_m2"],
            }
            for key_schema, key_notebook in mapping.items():
                val = current_inputs[key_schema]
                row[key_notebook + "_enc"] = int(
                    cls._encoders[key_notebook].transform([val])[0]
                )
            X_input = pd.DataFrame([row])[cls._features]
            X_scaled = cls._scaler.transform(X_input)
            prix_log = cls._model.predict(X_scaled)[0]
            pred.prix_predit = int(np.exp(prix_log))

        pred.save()
        return pred

    # ── DELETE une prédiction
    @staticmethod
    def delete_prediction(user_id: str, prediction_id: str) -> dict:
        pred = MLService.get_one(user_id, prediction_id)
        pred.delete()
        return {"message": "Prédiction supprimée avec succès."}

    # ── DELETE toutes les prédictions d'un user
    @staticmethod
    def delete_all_predictions(user_id: str) -> dict:
        user = User.objects(id=user_id).first()
        if not user:
            raise ValueError("Utilisateur introuvable.")
        count = MLPrediction.objects(user=user).delete()
        return {"message": f"{count} prédiction(s) supprimée(s)."}