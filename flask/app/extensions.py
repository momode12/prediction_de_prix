from flask_mongoengine import MongoEngine
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_mail import Mail

db = MongoEngine()
jwt = JWTManager()
bcrypt = Bcrypt()
mail = Mail()