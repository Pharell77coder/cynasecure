import os
from datetime import timedelta
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from database import db, mail

load_dotenv()  # charge backend/.env automatiquement

app = Flask(__name__)

# 1. Clé secrète
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-change-me')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['SESSION_COOKIE_HTTPONLY'] = True
# En prod (HTTPS, front sur un autre domaine : Vercel) il faut SAMESITE=None + SECURE=True
app.config['SESSION_COOKIE_SAMESITE'] = os.environ.get('SESSION_COOKIE_SAMESITE', 'Lax')
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('SESSION_COOKIE_SECURE', 'False') == 'True'

# 2. CORS : liste d'origines lue depuis .env, séparées par des virgules
cors_origins = os.environ.get(
    'CORS_ORIGINS',
    'http://localhost:5173,http://localhost:5174'
).split(',')
CORS(app, supports_credentials=True, origins=cors_origins)

# 3. Base de données : Postgres (Neon / Supabase / etc.), lue depuis .env
#    Format attendu : postgresql+psycopg2://user:password@host:port/dbname
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'postgresql+psycopg2://cyna:cyna@localhost:5432/cynasecure'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 4. Mail : Gmail SMTP (remplace Maildev)
#    MAIL_PASSWORD doit être un "mot de passe d'application" Google, pas le mot de passe du compte.
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USE_SSL'] = os.environ.get('MAIL_USE_SSL', 'False') == 'True'
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@cyna.com')

# 5. Stripe : les clés sont lues depuis l'environnement dans routes/payments.py
#    (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET dans .env)

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
from routes.dashboard import dashboard_bp

app.register_blueprint(users_bp)
app.register_blueprint(products_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(addresses_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(payment_methods_bp)
app.register_blueprint(payments_bp)
app.register_blueprint(contact_bp)
app.register_blueprint(dashboard_bp)

if __name__ == '__main__':
    app.run(
        debug=os.environ.get('FLASK_DEBUG', '0') == '1',
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000))
    )
