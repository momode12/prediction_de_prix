import os


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    DEBUG = False
    TESTING = False

    # MongoDB
    MONGODB_SETTINGS = {
        "db": os.getenv("MONGO_URI")
            .split("/")[-1],
        "host": os.getenv("MONGO_URI"),
    }

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES"))
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES"))
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    # Bcrypt
    BCRYPT_LOG_ROUNDS = int(os.getenv("BCRYPT_LOG_ROUNDS", 12))

    # Mail
    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_PORT = int(os.getenv("MAIL_PORT"))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS") == "True"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")

    # OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

    # ML
    ML_MODEL_PATH = os.getenv("ML_MODEL_PATH", "app/ml/model.pkl")
    ML_ENCODERS_PATH = os.getenv("ML_ENCODERS_PATH", "app/ml/encoders.pkl")
    ML_SCALER_PATH = os.getenv("ML_SCALER_PATH", "app/ml/scaler.pkl")
    ML_FEATURES_PATH = os.getenv("ML_FEATURES_PATH", "app/ml/features.pkl")


class DevConfig(Config):
    DEBUG = True


class ProdConfig(Config):
    DEBUG = False
    BCRYPT_LOG_ROUNDS = 14


class TestConfig(Config):
    TESTING = True
    MONGODB_SETTINGS = {
        "db": "immo_test",
        "host": "mongomock://localhost",
    }


config_by_name = {
    "dev": DevConfig,
    "prod": ProdConfig,
    "test": TestConfig,
}