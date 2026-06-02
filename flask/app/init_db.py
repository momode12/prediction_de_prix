import datetime
from flask import Flask


def init_db(app: Flask) -> None:
    """
    Appelé une seule fois au démarrage dans create_app().
    Crée les collections + indexes si ils n'existent pas encore.
    """
    with app.app_context():
        from app.models.user import User, SocialAccount
        from app.models.ml_prediction import MLPrediction

        # ── Force la création des collections + indexes
        User.ensure_indexes()
        MLPrediction.ensure_indexes()

        print("✅ Collections MongoDB initialisées :")
        print("   → users")
        print("   → ml_predictions")