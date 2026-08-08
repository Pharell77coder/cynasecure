import os
from datetime import timedelta
from flask import Flask
from flask_cors import CORS
from database import db, mail

app = Flask(__name__)

# 1. Clé secrète pour signer les cookies de session (⚠️ à définir en variable d'env en prod)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-change-me')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
# En prod (HTTPS + domaines différents) : SESSION_COOKIE_SAMESITE='None' + SESSION_COOKIE_SECURE=True

# 2. Autoriser React (Vite, port 5173) à faire des requêtes AVEC cookies de session
CORS(app, supports_credentials=True, origins=['http://localhost:5173', 'http://localhost:3000'])

# 3. Configuration MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/cynasecure'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 4. Configuration Maildev
app.config['MAIL_SERVER'] = 'localhost'
app.config['MAIL_PORT'] = 1025
app.config['MAIL_USERNAME'] = None
app.config['MAIL_PASSWORD'] = None
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_DEFAULT_SENDER'] = 'noreply@cyna.com'

# 5. Configuration Stripe (clés lues depuis l'environnement, jamais en dur dans le code)
#    export STRIPE_SECRET_KEY=sk_test_...
#    export STRIPE_PUBLISHABLE_KEY=pk_test_...
#    export STRIPE_WEBHOOK_SECRET=whsec_...   (donné par `stripe listen` en local)

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

app.register_blueprint(users_bp)
app.register_blueprint(products_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(addresses_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(payment_methods_bp)
app.register_blueprint(payments_bp)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
