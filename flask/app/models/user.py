import datetime
from app.extensions import db


class SocialAccount(db.EmbeddedDocument):
    """Compte social lié (Google, Facebook...)"""
    provider = db.StringField(required=True)          # "google" | "facebook"
    provider_id = db.StringField(required=True)       # ID unique chez le provider
    linked_at = db.DateTimeField(default=datetime.datetime.utcnow)


class User(db.Document):
    """
    Utilisateur principal.
    Suppression : cascade sur MLPrediction via signal post_delete.
    """
    # ── Champs principaux
    username = db.StringField(required=True, unique=True, min_length=3, max_length=50)
    email = db.StringField(required=True, unique=True)
    password_hash = db.StringField(default=None)      # None si compte social pur

    # ── Statut
    is_active = db.BooleanField(default=True)
    is_verified = db.BooleanField(default=False)      # vérification email

    # ── OAuth (liste de comptes sociaux liés)
    social_accounts = db.EmbeddedDocumentListField(SocialAccount, default=list)

    # ── Timestamps
    created_at = db.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = db.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "users",
        "indexes": ["email", "username"],
        "ordering": ["-created_at"],
    }

    def __repr__(self):
        return f"<User {self.username}>"