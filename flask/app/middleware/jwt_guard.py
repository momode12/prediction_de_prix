from functools import wraps
from flask import jsonify
from flask_jwt_extended import (
    verify_jwt_in_request,
    get_jwt_identity,
)
from app.models.user import User


def require_auth(fn):
    """
    Vérifie que le JWT est valide et que l'user
    existe en base et est actif.

    Usage :
        @prediction_bp.route("/predict", methods=["POST"])
        @require_auth
        def predict(current_user):
            ...
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception as e:
            return jsonify({
                "success": False,
                "message": "Token invalide ou expiré.",
                "error": str(e)
            }), 401

        user_id = get_jwt_identity()
        user = User.objects(id=user_id, is_active=True).first()

        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur introuvable ou désactivé."
            }), 401

        return fn(current_user=user, *args, **kwargs)

    return wrapper


def require_verified(fn):
    """
    Vérifie que le JWT est valide ET que l'email
    de l'user est vérifié.

    Usage :
        @prediction_bp.route("/predict", methods=["POST"])
        @require_verified
        def predict(current_user):
            ...
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception as e:
            return jsonify({
                "success": False,
                "message": "Token invalide ou expiré.",
                "error": str(e)
            }), 401

        user_id = get_jwt_identity()
        user = User.objects(id=user_id, is_active=True).first()

        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur introuvable ou désactivé."
            }), 401

        if not user.is_verified:
            return jsonify({
                "success": False,
                "message": "Email non vérifié. Vérifiez votre boîte mail."
            }), 403

        return fn(current_user=user, *args, **kwargs)

    return wrapper


def require_refresh(fn):
    """
    Vérifie que le token fourni est bien
    un refresh token (pas un access token).

    Usage :
        @auth_bp.route("/refresh", methods=["POST"])
        @require_refresh
        def refresh(current_user):
            ...
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request(refresh=True)
        except Exception as e:
            return jsonify({
                "success": False,
                "message": "Refresh token invalide ou expiré.",
                "error": str(e)
            }), 401

        user_id = get_jwt_identity()
        user = User.objects(id=user_id, is_active=True).first()

        if not user:
            return jsonify({
                "success": False,
                "message": "Utilisateur introuvable ou désactivé."
            }), 401

        return fn(current_user=user, *args, **kwargs)

    return wrapper