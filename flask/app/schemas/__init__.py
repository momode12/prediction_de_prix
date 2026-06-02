from app.schemas.auth_schema import (
    RegisterSchema,
    LoginSchema,
    UpdateUserSchema,
    ChangePasswordSchema,
    UserResponseSchema,
)
from app.schemas.prediction_schema import (
    PredictionInputSchema,
    PredictionUpdateSchema,
    PredictionResponseSchema,
)

__all__ = [
    "RegisterSchema", "LoginSchema", "UpdateUserSchema",
    "ChangePasswordSchema", "UserResponseSchema",
    "PredictionInputSchema", "PredictionUpdateSchema",
    "PredictionResponseSchema",
]
