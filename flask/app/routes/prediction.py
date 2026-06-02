from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from app.services.ml_service import MLService
from app.schemas.prediction_schema import (
    PredictionInputSchema,
    PredictionUpdateSchema,
    PredictionResponseSchema,
)
from app.middleware.jwt_guard import require_verified

prediction_bp = Blueprint("prediction", __name__)

# ── Instances schemas
input_schema = PredictionInputSchema()
update_schema = PredictionUpdateSchema()
response_schema = PredictionResponseSchema()
response_many_schema = PredictionResponseSchema(many=True)


# ════════════════════════════════════════
# POST — PRÉDIRE + SAUVEGARDER
# ════════════════════════════════════════
@prediction_bp.route("/predict", methods=["POST"])
@require_verified
def predict(current_user):
    """
    Prédit le prix d'un bien immobilier et sauvegarde en base.
    ---
    tags:
      - Prédictions
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - type_bien
            - surface_m2
            - nb_chambres
            - nombre_etages
            - annee_construction
            - etat_bien
            - region
            - quartier
            - prix_terrain_m2
            - accessibilite
            - douche_position
            - wc_position
            - garage
            - jardin
            - electricite
            - eau_courante
          properties:
            type_bien:
              type: string
              example: Villa
            surface_m2:
              type: integer
              example: 300
            nb_chambres:
              type: integer
              example: 5
            nombre_etages:
              type: integer
              example: 2
            annee_construction:
              type: integer
              example: 2020
            etat_bien:
              type: string
              example: Neuf
            region:
              type: string
              example: Analamanga
            quartier:
              type: string
              example: Quartier chic
            prix_terrain_m2:
              type: integer
              example: 800000
            accessibilite:
              type: string
              example: Route goudronnée
            douche_position:
              type: string
              example: Intérieure
            wc_position:
              type: string
              example: Intérieure
            garage:
              type: string
              example: Oui
            jardin:
              type: string
              example: Oui
            electricite:
              type: string
              example: Raccordé
            eau_courante:
              type: string
              example: Raccordée
            label:
              type: string
              example: Ma villa Analamanga
    responses:
      201:
        description: Prédiction effectuée et sauvegardée
        schema:
          type: object
          properties:
            success:
              type: boolean
            prediction:
              type: object
              properties:
                id:
                  type: string
                prix_predit:
                  type: integer
                prix_predit_millions:
                  type: number
                label:
                  type: string
                created_at:
                  type: string
      400:
        description: Erreur de validation des inputs
      401:
        description: Non authentifié
      403:
        description: Email non vérifié
      500:
        description: Erreur modèle ML
    """
    try:
        data = input_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"success": False, "errors": e.messages}), 400

    try:
        prediction = MLService.predict(str(current_user.id), data)
        return jsonify({
            "success": True,
            "prediction": response_schema.dump(prediction)
        }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ════════════════════════════════════════
# GET — HISTORIQUE COMPLET
# ════════════════════════════════════════
@prediction_bp.route("/predictions", methods=["GET"])
@require_verified
def get_history(current_user):
    """
    Retourne toutes les prédictions de l'utilisateur connecté.
    ---
    tags:
      - Prédictions
    security:
      - Bearer: []
    responses:
      200:
        description: Liste des prédictions
        schema:
          type: object
          properties:
            success:
              type: boolean
            count:
              type: integer
            predictions:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: string
                  prix_predit:
                    type: integer
                  prix_predit_millions:
                    type: number
                  label:
                    type: string
                  created_at:
                    type: string
      401:
        description: Non authentifié
      403:
        description: Email non vérifié
    """
    predictions = MLService.get_history(str(current_user.id))
    return jsonify({
        "success": True,
        "count": len(predictions),
        "predictions": response_many_schema.dump(predictions)
    }), 200


# ════════════════════════════════════════
# GET — UNE PRÉDICTION
# ════════════════════════════════════════
@prediction_bp.route("/predictions/<prediction_id>", methods=["GET"])
@require_verified
def get_one(current_user, prediction_id):
    """
    Retourne une prédiction par son ID.
    ---
    tags:
      - Prédictions
    security:
      - Bearer: []
    parameters:
      - in: path
        name: prediction_id
        required: true
        type: string
    responses:
      200:
        description: Prédiction trouvée
      404:
        description: Prédiction introuvable
      401:
        description: Non authentifié
    """
    try:
        prediction = MLService.get_one(str(current_user.id), prediction_id)
        return jsonify({
            "success": True,
            "prediction": response_schema.dump(prediction)
        }), 200
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 404


# ════════════════════════════════════════
# PATCH — MODIFIER UNE PRÉDICTION
# ════════════════════════════════════════
@prediction_bp.route("/predictions/<prediction_id>", methods=["PATCH"])
@require_verified
def update_prediction(current_user, prediction_id):
    """
    Modifie le label et/ou recalcule le prix si les inputs changent.
    ---
    tags:
      - Prédictions
    security:
      - Bearer: []
    parameters:
      - in: path
        name: prediction_id
        required: true
        type: string
      - in: body
        name: body
        schema:
          type: object
          properties:
            label:
              type: string
              example: Nouveau label
            surface_m2:
              type: integer
              example: 350
            nb_chambres:
              type: integer
              example: 6
    responses:
      200:
        description: Prédiction mise à jour
      400:
        description: Erreur de validation
      404:
        description: Prédiction introuvable
      401:
        description: Non authentifié
    """
    try:
        data = update_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"success": False, "errors": e.messages}), 400

    try:
        prediction = MLService.update_prediction(
            str(current_user.id), prediction_id, data
        )
        return jsonify({
            "success": True,
            "message": "Prédiction mise à jour.",
            "prediction": response_schema.dump(prediction)
        }), 200
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 404


# ════════════════════════════════════════
# DELETE — UNE PRÉDICTION
# ════════════════════════════════════════
@prediction_bp.route("/predictions/<prediction_id>", methods=["DELETE"])
@require_verified
def delete_prediction(current_user, prediction_id):
    """
    Supprime une prédiction par son ID.
    ---
    tags:
      - Prédictions
    security:
      - Bearer: []
    parameters:
      - in: path
        name: prediction_id
        required: true
        type: string
    responses:
      200:
        description: Prédiction supprimée
      404:
        description: Prédiction introuvable
      401:
        description: Non authentifié
    """
    try:
        result = MLService.delete_prediction(str(current_user.id), prediction_id)
        return jsonify({"success": True, **result}), 200
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 404


# ════════════════════════════════════════
# DELETE — TOUTES LES PRÉDICTIONS
# ════════════════════════════════════════
@prediction_bp.route("/predictions", methods=["DELETE"])
@require_verified
def delete_all(current_user):
    """
    Supprime toutes les prédictions de l'utilisateur connecté.
    ---
    tags:
      - Prédictions
    security:
      - Bearer: []
    responses:
      200:
        description: Toutes les prédictions supprimées
      401:
        description: Non authentifié
    """
    result = MLService.delete_all_predictions(str(current_user.id))
    return jsonify({"success": True, **result}), 200