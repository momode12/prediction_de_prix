from flask import current_app
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from app.extensions import mail
from app.models.user import User


class EmailService:

    @staticmethod
    def _serializer() -> URLSafeTimedSerializer:
        return URLSafeTimedSerializer(current_app.config["SECRET_KEY"])

    # ── Envoi email de vérification
    @classmethod
    def send_verification(cls, user: User) -> None:
        token = cls._serializer().dumps(
            str(user.id), salt="email-verify"
        )
        link = f"http://localhost:5000/auth/verify/{token}"
        msg = Message(
            subject="Vérifiez votre adresse email — Immo Madagascar",
            recipients=[user.email],
            html=f"""
            <h2>Bonjour {user.username},</h2>
            <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
            <a href="{link}">{link}</a>
            <p>Ce lien expire dans <strong>24 heures</strong>.</p>
            """,
        )
        mail.send(msg)

    # ── Vérification du token
    @classmethod
    def verify_token(cls, token: str, max_age: int = 86400) -> dict:
        try:
            user_id = cls._serializer().loads(
                token, salt="email-verify", max_age=max_age
            )
        except SignatureExpired:
            raise ValueError("Lien expiré. Demandez un nouveau lien.")
        except BadSignature:
            raise ValueError("Lien invalide.")

        user = User.objects(id=user_id).first()
        if not user:
            raise ValueError("Utilisateur introuvable.")

        user.is_verified = True
        user.save()
        return {"message": "Email vérifié avec succès."}

    # ── Renvoi du mail de vérification
    @classmethod
    def resend_verification(cls, user_id: str) -> dict:
        user = User.objects(id=user_id, is_active=True).first()
        if not user:
            raise ValueError("Utilisateur introuvable.")
        if user.is_verified:
            raise ValueError("Email déjà vérifié.")
        cls.send_verification(user)
        return {"message": "Email de vérification renvoyé."}