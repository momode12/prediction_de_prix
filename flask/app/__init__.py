from flask import Flask
from flasgger import Swagger
from flask_cors import CORS
from dotenv import load_dotenv

from app.config import config_by_name
from app.extensions import db, jwt, bcrypt, mail
from app.init_db import init_db          # ← ajouter

load_dotenv()


def create_app(config_name: str = "dev") -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)
    CORS(app,
         resources={r"/*": {
             "origins":             ["http://localhost:3000", "http://localhost:5173"],
             "methods":             ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers":       ["Content-Type", "Authorization"],
             "expose_headers":      ["Content-Type", "Authorization"],
             "supports_credentials": True,
         }})

    # Swagger
    Swagger(app, template={
        "swagger": "2.0",
        "info": {
            "title": "Immo Madagascar API",
            "description": "API de prédiction de prix immobilier — Madagascar",
            "version": "1.0.0",
            "contact": {"email": "contact@immo-mada.mg"},
        },
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "Format : Bearer <token>",
            }
        },
        "security": [{"Bearer": []}],
        "basePath": "/",
        "consumes": ["application/json"],
        "produces": ["application/json"],
    })

    # Blueprints
    from app.routes.auth import auth_bp
    from app.routes.oauth import oauth_bp
    from app.routes.prediction import prediction_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(oauth_bp, url_prefix="/auth/oauth")
    app.register_blueprint(prediction_bp, url_prefix="/api")

    # ── Init collections MongoDB        ← ajouter
    init_db(app)

    return app