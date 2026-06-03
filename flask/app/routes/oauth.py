import os
from flask import Blueprint, request, jsonify, redirect

from app.services.oauth_service import OAuthService

oauth_bp = Blueprint("oauth", __name__)

GOOGLE_AUTH_URL = (
    "https://accounts.google.com/o/oauth2/v2/auth"
    "?response_type=code"
    "&scope=openid%20email%20profile"
    "&client_id={client_id}"
    "&redirect_uri={redirect_uri}"
)


# ════════════════════════════════════════
# GOOGLE — REDIRECT
# ════════════════════════════════════════
@oauth_bp.route("/google", methods=["GET"])
def google_login():
    """
    Redirige vers la page de connexion Google.
    ---
    tags:
      - OAuth
    responses:
      302:
        description: Redirection vers Google
    """
    url = GOOGLE_AUTH_URL.format(
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        redirect_uri=os.getenv("GOOGLE_REDIRECT_URI"),
    )
    return redirect(url)


# ════════════════════════════════════════
# GOOGLE — CALLBACK
# ════════════════════════════════════════
@oauth_bp.route("/google/callback", methods=["GET"])
def google_callback():
    """
    Callback Google OAuth — retourne les tokens JWT.
    ---
    tags:
      - OAuth
    parameters:
      - in: query
        name: code
        required: true
        type: string
        description: Code d'autorisation retourné par Google
    responses:
      200:
        description: Connexion réussie via Google
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
        description: Code manquant ou invalide
      500:
        description: Erreur lors de l'échange avec Google
    """
    code = request.args.get("code")
    if not code:
        return redirect(f"http://localhost:5173/login?error=missing_code")

    try:
        result = OAuthService.google_callback(code)
        # ── Rediriger vers le frontend avec les tokens dans l'URL
        access = result["access_token"]
        refresh = result["refresh_token"]
        user = result["user"]
        import json, urllib.parse
        user_encoded = urllib.parse.quote(json.dumps(user))
        return redirect(
            f"http://localhost:5173/oauth/callback"
            f"?access_token={access}"
            f"&refresh_token={refresh}"
            f"&user={user_encoded}"
        )
    except Exception as e:
        return redirect(f"http://localhost:5173/login?error={str(e)}")