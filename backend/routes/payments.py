import os
import stripe
from flask import Blueprint, jsonify, request, session, current_app
from database import db
from models.user import User
from models.product import Product
from models.order import Order
from models.order_item import OrderItem
from models.payment_method import PaymentMethod
from utils.auth import login_required

payments_bp = Blueprint('payments', __name__)

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')


def _get_or_create_stripe_customer(user):
    """Récupère le Customer Stripe de l'utilisateur, le crée s'il n'existe pas encore."""
    if user.stripe_customer_id:
        return user.stripe_customer_id

    customer = stripe.Customer.create(
        email=user.email,
        name=user.username,
        metadata={'user_id': user.id}
    )
    user.stripe_customer_id = customer.id
    db.session.commit()
    return customer.id


# ==========================================
# 1. CRÉER UNE INTENTION DE PAIEMENT (page Paiement)
# ==========================================
@payments_bp.route('/api/payments/create-payment-intent', methods=['POST'])
@login_required
def create_payment_intent():
    data = request.get_json() or {}
    items = data.get('items') or []
    billing_address_id = data.get('billing_address_id')

    if not items:
        return jsonify({'message': 'Le panier est vide.'}), 400

    user = User.query.get(session['user_id'])

    # On recalcule le montant côté serveur à partir des prix en base : on ne fait
    # JAMAIS confiance à un montant envoyé par le client.
    total_amount = 0
    order_items_data = []
    for item in items:
        product = Product.query.get(item.get('product_id'))
        quantity = int(item.get('quantity', 1))
        if not product or not product.available or quantity < 1:
            return jsonify({'message': f'Produit indisponible (id {item.get("product_id")}).'}), 400
        total_amount += product.price_monthly * quantity
        order_items_data.append((product, quantity))

    try:
        customer_id = _get_or_create_stripe_customer(user)

        order = Order(
            status='pending',
            total_amount=total_amount,
            user_id=user.id,
            billing_address_id=billing_address_id
        )
        db.session.add(order)
        db.session.flush()  # récupère order.id avant le commit

        for product, quantity in order_items_data:
            db.session.add(OrderItem(
                quantity=quantity,
                unit_price=product.price_monthly,
                order_id=order.id,
                product_id=product.id
            ))

        intent = stripe.PaymentIntent.create(
            amount=total_amount * 100,  # Stripe attend des centimes
            currency='eur',
            customer=customer_id,
            metadata={'order_id': order.id, 'user_id': user.id},
            automatic_payment_methods={'enabled': True},
            setup_future_usage='off_session'  # permet d'enregistrer la carte pour la revoir dans "Compte"
        )
        order.stripe_payment_intent_id = intent.id
        db.session.commit()

        return jsonify({
            'client_secret': intent.client_secret,
            'order_id': order.id,
            'total_amount': total_amount
        }), 201
    except stripe.error.StripeError as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur Stripe', 'error': str(e)}), 502
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500


# ==========================================
# 2. CRÉER UNE SETUP INTENT (enregistrer une carte sans payer, page Compte)
# ==========================================
@payments_bp.route('/api/payments/create-setup-intent', methods=['POST'])
@login_required
def create_setup_intent():
    user = User.query.get(session['user_id'])
    try:
        customer_id = _get_or_create_stripe_customer(user)
        setup_intent = stripe.SetupIntent.create(
            customer=customer_id,
            automatic_payment_methods={'enabled': True}
        )
        return jsonify({'client_secret': setup_intent.client_secret}), 201
    except stripe.error.StripeError as e:
        return jsonify({'message': 'Erreur Stripe', 'error': str(e)}), 502


# ==========================================
# 3. WEBHOOK STRIPE (source de vérité pour la confirmation de paiement)
# ==========================================
@payments_bp.route('/api/payments/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        return jsonify({'message': 'Webhook invalide'}), 400

    event_type = event['type']
    obj = event['data']['object']

    if event_type == 'payment_intent.succeeded':
        order_id = obj.get('metadata', {}).get('order_id')
        order = Order.query.get(order_id) if order_id else None
        if order:
            order.status = 'paid'
            db.session.commit()

    elif event_type == 'payment_intent.payment_failed':
        order_id = obj.get('metadata', {}).get('order_id')
        order = Order.query.get(order_id) if order_id else None
        if order:
            order.status = 'failed'
            db.session.commit()

    elif event_type == 'setup_intent.succeeded':
        customer_id = obj.get('customer')
        pm_id = obj.get('payment_method')
        user = User.query.filter_by(stripe_customer_id=customer_id).first()
        if user and pm_id and not PaymentMethod.query.filter_by(stripe_payment_method_id=pm_id).first():
            pm = stripe.PaymentMethod.retrieve(pm_id)
            card = pm.get('card', {})
            db.session.add(PaymentMethod(
                brand=card.get('brand'),
                last4=card.get('last4'),
                is_default=not PaymentMethod.query.filter_by(user_id=user.id).first(),
                stripe_payment_method_id=pm_id,
                user_id=user.id
            ))
            db.session.commit()

    return jsonify({'received': True}), 200


# ==========================================
# 4. CONFIG PUBLIQUE (clé publishable pour le front)
# ==========================================
@payments_bp.route('/api/payments/config', methods=['GET'])
def payments_config():
    return jsonify({'publishable_key': os.environ.get('STRIPE_PUBLISHABLE_KEY')}), 200
