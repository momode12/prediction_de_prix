from marshmallow import Schema, fields, validate, validates, ValidationError
from app.models.user import User


class RegisterSchema(Schema):
    username = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=50),
        error_messages={"required": "Le nom d'utilisateur est obligatoire."}
    )
    email = fields.Email(
        required=True,
        error_messages={"required": "L'email est obligatoire."}
    )
    password = fields.Str(
        required=True,
        validate=validate.Length(min=6),
        load_only=True,
        error_messages={"required": "Le mot de passe est obligatoire."}
    )

    @validates("email")
    def validate_email_unique(self, value):
        if User.objects(email=value).first():
            raise ValidationError("Cet email est déjà utilisé.")

    @validates("username")
    def validate_username_unique(self, value):
        if User.objects(username=value).first():
            raise ValidationError("Ce nom d'utilisateur est déjà pris.")


class LoginSchema(Schema):
    email = fields.Email(
        required=True,
        error_messages={"required": "L'email est obligatoire."}
    )
    password = fields.Str(
        required=True,
        load_only=True,
        error_messages={"required": "Le mot de passe est obligatoire."}
    )


class UpdateUserSchema(Schema):
    """CRUD compte — modification username ou email."""
    username = fields.Str(
        validate=validate.Length(min=3, max=50)
    )
    email = fields.Email()

    @validates("email")
    def validate_email_unique(self, value):
        if User.objects(email=value).first():
            raise ValidationError("Cet email est déjà utilisé.")

    @validates("username")
    def validate_username_unique(self, value):
        if User.objects(username=value).first():
            raise ValidationError("Ce nom d'utilisateur est déjà pris.")


class ChangePasswordSchema(Schema):
    old_password = fields.Str(
        required=True,
        load_only=True,
        error_messages={"required": "L'ancien mot de passe est obligatoire."}
    )
    new_password = fields.Str(
        required=True,
        validate=validate.Length(min=6),
        load_only=True,
        error_messages={"required": "Le nouveau mot de passe est obligatoire."}
    )


class UserResponseSchema(Schema):
    """Sérialisation user — jamais le password_hash."""
    id = fields.Method("get_id")
    username = fields.Str()
    email = fields.Email()
    is_active = fields.Bool()
    is_verified = fields.Bool()
    created_at = fields.DateTime(format="%Y-%m-%d %H:%M:%S")
    updated_at = fields.DateTime(format="%Y-%m-%d %H:%M:%S")

    def get_id(self, obj):
        return str(obj.id)