import datetime
from flask_jwt_extended import create_access_token, create_refresh_token
from app.extensions import bcrypt
from app.models.user import User
from app.models.ml_prediction import MLPrediction


class AuthService:

    # ── REGISTER
    @staticmethod
    def register(username: str, email: str, password: str) -> dict:
        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
        user = User(
            username=username,
            email=email,
            password_hash=password_hash,
        )
        user.save()
        return {"message": "Compte créé avec succès.", "user_id": str(user.id)}

    # ── LOGIN
    @staticmethod
    def login(email: str, password: str) -> dict:
        user = User.objects(email=email, is_active=True).first()
        if not user:
            raise ValueError("Email ou mot de passe incorrect.")
        if not user.password_hash:
            raise ValueError("Ce compte utilise une connexion sociale. Connectez-vous via Google.")
        if not bcrypt.check_password_hash(user.password_hash, password):
            raise ValueError("Email ou mot de passe incorrect.")

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

    # ── REFRESH TOKEN
    @staticmethod
    def refresh(user_id: str) -> dict:
        access_token = create_access_token(identity=user_id)
        return {"access_token": access_token}

    # ────────────────────────────────
    # CRUD COMPTE
    # ────────────────────────────────

    # ── GET profil
    @staticmethod
    def get_profile(user_id: str) -> User:
        user = User.objects(id=user_id, is_active=True).first()
        if not user:
            raise ValueError("Utilisateur introuvable.")
        return user

    # ── UPDATE profil (username / email)
    @staticmethod
    def update_profile(user_id: str, data: dict) -> User:
        user = User.objects(id=user_id, is_active=True).first()
        if not user:
            raise ValueError("Utilisateur introuvable.")

        if "username" in data:
            user.username = data["username"]
        if "email" in data:
            user.email = data["email"]
            user.is_verified = False          # re-vérification si email change

        user.updated_at = datetime.datetime.utcnow()
        user.save()
        return user

    # ── CHANGE PASSWORD
    @staticmethod
    def change_password(user_id: str, old_password: str, new_password: str) -> dict:
        user = User.objects(id=user_id, is_active=True).first()
        if not user:
            raise ValueError("Utilisateur introuvable.")
        if not user.password_hash:
            raise ValueError("Compte social — pas de mot de passe à modifier.")
        if not bcrypt.check_password_hash(user.password_hash, old_password):
            raise ValueError("Ancien mot de passe incorrect.")

        user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
        user.updated_at = datetime.datetime.utcnow()
        user.save()
        return {"message": "Mot de passe mis à jour avec succès."}

    # ── DELETE compte (cascade automatique sur MLPrediction)
    @staticmethod
    def delete_account(user_id: str) -> dict:
        user = User.objects(id=user_id).first()
        if not user:
            raise ValueError("Utilisateur introuvable.")

        # La suppression de l'user déclenche CASCADE sur MLPrediction
        # grâce à reverse_delete_rule=db.CASCADE dans le model
        user.delete()
        return {"message": "Compte et toutes les données associées supprimés définitivement."}

    # ── LIST tous les users (admin)
    @staticmethod
    def list_users() -> list:
        return User.objects(is_active=True).order_by("-created_at").all()