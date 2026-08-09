import os
from datetime import timedelta
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from database import db, mail

# Charge le .env AVANT toute lecture de os.environ
load_dotenv()

app = Flask(__name__)

# 1. Clé secrète
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-change-me')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# 2. CORS (origines lues depuis le .env)
cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')
CORS(app, supports_credentials=True, origins=cors_origins)

# 3. Base de données
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 'mysql+pymysql://root:@localhost/cynasecure'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 4. Mail
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'localhost')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 1025))
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'False') == 'True'
app.config['MAIL_USE_SSL'] = os.environ.get('MAIL_USE_SSL', 'False') == 'True'
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@cyna.com')

# 5. Stripe : les clés sont lues directement par routes/payments.py via os.environ.get,
#    donc rien à faire ici tant que load_dotenv() a été appelé en premier dans ce fichier.

mail.init_app(app)
db.init_app(app)

# 6. Enregistrer les routes (Blueprints)
from routes.users import users_bp
from routes.products import products_bp
from routes.categories import categories_bp
from routes.addresses import addresses_bp
from routes.orders import orders_bp
from routes.payment_methods import payment_methods_bp
from routes.payments import payments_bp
from routes.contact import contact_bp

app.register_blueprint(users_bp)
app.register_blueprint(products_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(addresses_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(payment_methods_bp)
app.register_blueprint(payments_bp)
app.register_blueprint(contact_bp)

if __name__ == '__main__':
    app.run(debug=app.config.get('FLASK_DEBUG', True), host='0.0.0.0', port=5000)