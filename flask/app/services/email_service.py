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
    def send_verification(cls, user) -> None:
        token = cls._serializer().dumps(
            str(user.id), salt="email-verify"
        )
        # ── Lien vers le frontend (pas le backend)
        link = f"http://localhost:5173/verify-email/{token}"
        msg = Message(
            subject="Vérifiez votre adresse email — Prédiction de prix Immobilier de Madagascar",
            recipients=[user.email],
            html=f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Inter, sans-serif; background: #f0f9ff;
                        margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: white;
                        border-radius: 16px; padding: 40px;
                        box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

                <!-- Logo -->
                <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background: #0284c7;
                            width: 56px; height: 56px; border-radius: 14px;
                            line-height: 56px; font-size: 24px;
                            font-weight: bold; color: white;">I</div>
                <h1 style="margin: 12px 0 0; font-size: 22px; color: #0f172a;">
                    Prédiction de prix Immobilier <span style="color: #0284c7;">de Madagascar</span>
                </h1>
                </div>

                <!-- Title -->
                <h2 style="font-size: 20px; font-weight: 700;
                        color: #0f172a; margin: 0 0 8px;">
                Vérifiez votre adresse email
                </h2>
                <p style="color: #64748b; font-size: 14px;
                        line-height: 1.6; margin: 0 0 24px;">
                Bonjour <strong>{user.username}</strong>,<br/>
                Cliquez sur le bouton ci-dessous pour activer votre compte.
                Ce lien expire dans <strong>24 heures</strong>.
                </p>

                <!-- Button -->
                <div style="text-align: center; margin: 32px 0;">
                <a href="{link}"
                    style="display: inline-block; background: #0284c7;
                            color: white; font-weight: 600; font-size: 15px;
                            padding: 14px 32px; border-radius: 10px;
                            text-decoration: none;">
                    Vérifier mon email
                </a>
                </div>

                <!-- Fallback link -->
                <p style="color: #94a3b8; font-size: 12px;
                        text-align: center; margin: 24px 0 0;">
                Si le bouton ne fonctionne pas, copiez ce lien :<br/>
                <a href="{link}" style="color: #0284c7; word-break: break-all;">
                    {link}
                </a>
                </p>

                <!-- Footer -->
                <hr style="border: none; border-top: 1px solid #f1f5f9;
                        margin: 32px 0 16px;"/>
                <p style="color: #cbd5e1; font-size: 11px; text-align: center; margin: 0;">
                Prédiction de prix Immobilier de Madagascar<br/>
                Si vous n'avez pas créé de compte, ignorez cet email.
                </p>
            </div>
            </body>
            </html>
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
    from app.models.user import User
    user = User.objects(id=user_id, is_active=True).first()
    if not user:
        raise ValueError("Utilisateur introuvable.")
    if user.is_verified:
        raise ValueError("Email déjà vérifié.")
    cls.send_verification(user)
    return {"message": "Email de vérification renvoyé."}