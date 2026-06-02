import os
import requests
from flask_jwt_extended import create_access_token, create_refresh_token
from app.models.user import User, SocialAccount


GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


class OAuthService:

    @staticmethod
    def google_callback(code: str) -> dict:
        """
        Échange le code Google contre un token,
        récupère le profil, crée ou connecte l'user.
        """
        # ── 1. Échange code → access_token Google
        token_resp = requests.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
            "grant_type": "authorization_code",
        })
        token_resp.raise_for_status()
        google_token = token_resp.json().get("access_token")

        # ── 2. Récupération profil Google
        profile_resp = requests.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {google_token}"}
        )
        profile_resp.raise_for_status()
        profile = profile_resp.json()

        google_id = profile.get("sub")
        email = profile.get("email")
        name = profile.get("name", email.split("@")[0])

        # ── 3. User existant avec ce compte social ?
        user = User.objects(
            social_accounts__provider="google",
            social_accounts__provider_id=google_id
        ).first()

        if not user:
            # Existe-t-il avec le même email ?
            user = User.objects(email=email).first()
            if user:
                # Lier le compte Google à l'user existant
                user.social_accounts.append(
                    SocialAccount(provider="google", provider_id=google_id)
                )
                user.save()
            else:
                # Créer un nouvel user
                username = OAuthService._unique_username(name)
                user = User(
                    username=username,
                    email=email,
                    is_verified=True,
                    social_accounts=[
                        SocialAccount(provider="google", provider_id=google_id)
                    ]
                )
                user.save()

        # ── 4. Génération tokens JWT
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "is_verified": user.is_verified,
            }
        }

    @staticmethod
    def _unique_username(base: str) -> str:
        """Génère un username unique à partir du nom Google."""
        base = base.lower().replace(" ", "_")[:30]
        username = base
        counter = 1
        while User.objects(username=username).first():
            username = f"{base}_{counter}"
            counter += 1
        return username