from app.routes.auth import auth_bp
from app.routes.oauth import oauth_bp
from app.routes.prediction import prediction_bp

__all__ = ["auth_bp", "oauth_bp", "prediction_bp"]