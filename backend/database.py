from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail

# Instances partagées, initialisées plus tard dans app.py avec .init_app(app)
# Ça évite le "from app import mail" à l'intérieur des routes,
# qui est un import circulaire fragile.
db = SQLAlchemy()
mail = Mail()