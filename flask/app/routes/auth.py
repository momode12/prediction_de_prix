from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from flask_jwt_extended import get_jwt_identity

from app.services.auth_service import AuthService
from app.services.email_service import EmailService
from app.schemas.auth_schema import (
    RegisterSchema, LoginSchema,
    UpdateUserSchema, ChangePasswordSchema,
    UserResponseSchema,
)
from app.middleware.jwt_guard import require_auth, require_refresh

auth_bp = Blueprint("auth", __name__)

# ── Instances schemas
register_schema = RegisterSchema()
login_schema = LoginSchema()
update_schema = UpdateUserSchema()
change_pw_schema = ChangePasswordSchema()
user_response_schema = UserResponseSchema()


# ════════════════════════════════════════
# REGISTER
# ════════════════════════════════════════
@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Créer un compte utilisateur.
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [username, email, password]
          properties:
            username:
              type: string
              example: rakoto
            email:
              type: string
              example: rakoto@gmail.com
            password:
              type: string
              example: secret123
    responses:
      201:
        description: Compte créé avec succès
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            user_id:
              type: string
      400:
        description: Erreur de validation
      500:
        description: Erreur serveur
    """
    try:
        data = register_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"success": False, "errors": e.messages}), 400

    try:
        result = AuthService.register(
            username=data["username"],
            email=data["email"],
            password=data["password"],
        )
        # ── Orchestration : envoi email de vérification après register
        from app.models.user import User
        user = User.objects(id=result["user_id"]).first()
        EmailService.send_verification(user)

        return jsonify({"success": True, **result}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# ════════════════════════════════════════
# LOGIN
# ════════════════════════════════════════
@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Connexion utilisateur — retourne access + refresh token.
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [email, password]
          properties:
            email:
              type: string
              example: rakoto@gmail.com
            password:
              type: string
              example: secret123
    responses:
      200:
        description: Connexion réussie
        schema:
          type: object
          properties:
            success:
              type: boolean
            access_token:
              type: string
            refresh_token:
              type: string
            user:
              type: object
              properties:
                id:
                  type: string
                username:
                  type: string
                email:
                  type: string
                is_verified:
                  type: boolean
      400:
        description: Erreur de validation
      401:
        description: Email ou mot de passe incorrect
    """
    try:
        data = login_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"success": False, "errors": e.messages}), 400

    try:
        result = AuthService.login(data["email"], data["password"])
        return jsonify({"success": True, **result}), 200
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 401


# ════════════════════════════════════════
# REFRESH TOKEN
# ════════════════════════════════════════
@auth_bp.route("/refresh", methods=["POST"])
@require_refresh
def refresh(current_user):
    """
    Renouvelle l'access token via le refresh token.
    ---
    tags:
      - Auth
    security:
      - Bearer: []
    responses:
      200:
        description: Nouveau access token
        schema:
          type: object
          properties:
            success:
              type: boolean
            access_token:
              type: string
      401:
        description: Refresh token invalide ou expiré
    """
    result = AuthService.refresh(str(current_user.id))
    return jsonify({"success": True, **result}), 200


# ════════════════════════════════════════
# VERIFY EMAIL
# ════════════════════════════════════════
@auth_bp.route("/verify/<token>", methods=["GET"])
def verify_email(token):
    """
    Vérifie l'adresse email via le lien reçu par mail.
    ---
    tags:
      - Auth
    parameters:
      - in: path
        name: token
        required: true
        type: string
    responses:
      200:
        description: Email vérifié avec succès
      400:
        description: Lien invalide ou expiré
    """
    try:
        result = EmailService.verify_token(token)
        return jsonify({"success": True, **result}), 200
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400


# ════════════════════════════════════════
# RESEND VERIFICATION
# ════════════════════════════════════════
@auth_bp.route("/resend-verification", methods=["POST"])
@require_auth
def resend_verification(current_user):
    """
    Renvoie l'email de vérification.
    ---
    tags:
      - Auth
    security:
      - Bearer: []
    responses:
      200:
        description: Email renvoyé
      400:
        description: Email déjà vérifié
      401:
        description: Non authentifié
    """
    try:
        result = EmailService.resend_verification(str(current_user.id))
        return jsonify({"success": True, **result}), 200
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400


# ════════════════════════════════════════
# GET PROFIL
# ════════════════════════════════════════
@auth_bp.route("/me", methods=["GET"])
@require_auth
def get_profile(current_user):
    """
    Retourne le profil de l'utilisateur connecté.
    ---
    tags:
      - Compte
    security:
      - Bearer: []
    responses:
      200:
        description: Profil utilisateur
        schema:
          type: object
          properties:
            success:
              type: boolean
            user:
              type: object
              properties:
                id:
                  type: string
                username:
                  type: string
                email:
                  type: string
                is_active:
                  type: boolean
                is_verified:
                  type: boolean
                created_at:
                  type: string
                updated_at:
                  type: string
      401:
        description: Non authentifié
    """
    return jsonify({
        "success": True,
        "user": user_response_schema.dump(current_user)
    }), 200


# ════════════════════════════════════════
# UPDATE PROFIL
# ════════════════════════════════════════
@auth_bp.route("/me", methods=["PATCH"])
@require_auth
def update_profile(current_user):
    """
    Modifie username et/ou email.
    ---
    tags:
      - Compte
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            username:
              type: string
              example: rakoto_v2
            email:
              type: string
              example: nouveau@gmail.com
    responses:
      200:
        description: Profil mis à jour
      400:
        description: Erreur de validation
      401:
        description: Non authentifié
    """
    try:
        data = update_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"success": False, "errors": e.messages}), 400

    try:
        user = AuthService.update_profile(str(current_user.id), data)
        return jsonify({
            "success": True,
            "message": "Profil mis à jour.",
            "user": user_response_schema.dump(user)
        }), 200
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400


# ════════════════════════════════════════
# CHANGE PASSWORD
# ════════════════════════════════════════
@auth_bp.route("/me/password", methods=["PATCH"])
@require_auth
def change_password(current_user):
    """
    Modifie le mot de passe de l'utilisateur connecté.
    ---
    tags:
      - Compte
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [old_password, new_password]
          properties:
            old_password:
              type: string
              example: secret123
            new_password:
              type: string
              example: nouveau456
    responses:
      200:
        description: Mot de passe mis à jour
      400:
        description: Ancien mot de passe incorrect
      401:
        description: Non authentifié
    """
    try:
        data = change_pw_schema.load(request.get_json() or {})
    except ValidationError as e:
        return jsonify({"success": False, "errors": e.messages}), 400

    try:
        result = AuthService.change_password(
            str(current_user.id),
            data["old_password"],
            data["new_password"],
        )
        return jsonify({"success": True, **result}), 200
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400


# ════════════════════════════════════════
# DELETE COMPTE
# ════════════════════════════════════════
@auth_bp.route("/me", methods=["DELETE"])
@require_auth
def delete_account(current_user):
    """
    Supprime définitivement le compte et toutes les prédictions liées.
    ---
    tags:
      - Compte
    security:
      - Bearer: []
    responses:
      200:
        description: Compte supprimé — base vide pour cet utilisateur
      401:
        description: Non authentifié
    """
    try:
        result = AuthService.delete_account(str(current_user.id))
        return jsonify({"success": True, **result}), 200
    except ValueError as e:
        return jsonify({"success": False, "message": str(e)}), 400