from flask import Blueprint, jsonify, request, session
from database import db
from models.order import Order
from models.order_item import OrderItem
from models.product import Product
from utils.auth import login_required, admin_required

orders_bp = Blueprint('orders', __name__)

VALID_STATUSES = ['pending', 'paid', 'failed', 'cancelled']


# --- COMMANDES DE L'UTILISATEUR CONNECTÉ (page Compte) ---
@orders_bp.route('/api/orders', methods=['GET'])
@login_required
def get_orders():
    orders = Order.query.filter_by(user_id=session['user_id']).order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200


@orders_bp.route('/api/orders/<int:id>', methods=['GET'])
@login_required
def get_order(id):
    order = Order.query.get(id)
    if not order or order.user_id != session['user_id']:
        return jsonify({'message': 'Commande non trouvée'}), 404
    return jsonify(order.to_dict()), 200


# --- ADMIN : LISTE / CRÉATION / MISE À JOUR / SUPPRESSION (back office) ---
@orders_bp.route('/api/admin/orders', methods=['GET'])
@admin_required
def admin_get_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200


# Création manuelle d'une commande par un admin (ex : commande passée par téléphone).
# Le montant est toujours recalculé côté serveur à partir des prix en base,
# jamais fait confiance à un total envoyé par le client.
@orders_bp.route('/api/admin/orders', methods=['POST'])
@admin_required
def admin_create_order():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    items = data.get('items') or []
    status = data.get('status', 'pending')
    billing_address_id = data.get('billing_address_id')

    if not user_id:
        return jsonify({'message': 'Le client est obligatoire.'}), 400
    if not items:
        return jsonify({'message': 'Au moins un article est obligatoire.'}), 400
    if status not in VALID_STATUSES:
        return jsonify({'message': f'Statut invalide. Valeurs possibles : {", ".join(VALID_STATUSES)}'}), 400

    total_amount = 0
    prepared_items = []
    for item in items:
        product = Product.query.get(item.get('product_id'))
        try:
            quantity = int(item.get('quantity', 1))
        except (TypeError, ValueError):
            quantity = 0
        billing_period = item.get('billing_period') if item.get('billing_period') in ('monthly', 'annual') else 'monthly'

        if not product or quantity < 1:
            return jsonify({'message': f'Produit invalide (id {item.get("product_id")}).'}), 400

        unit_price = (
            product.price_annual if product.price_annual is not None else product.price_monthly * 10
        ) if billing_period == 'annual' else product.price_monthly

        total_amount += unit_price * quantity
        prepared_items.append((product, quantity, billing_period, unit_price))

    order = Order(
        status=status,
        total_amount=total_amount,
        user_id=user_id,
        billing_address_id=billing_address_id
    )
    try:
        db.session.add(order)
        db.session.flush()  # récupère order.id avant le commit

        for product, quantity, billing_period, unit_price in prepared_items:
            db.session.add(OrderItem(
                quantity=quantity,
                unit_price=unit_price,
                billing_period=billing_period,
                order_id=order.id,
                product_id=product.id
            ))

        db.session.commit()
        return jsonify({'message': 'Commande créée !', 'order': order.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500


@orders_bp.route('/api/admin/orders/<int:id>', methods=['PUT'])
@admin_required
def admin_update_order(id):
    order = Order.query.get(id)
    if not order:
        return jsonify({'message': 'Commande non trouvée'}), 404

    data = request.get_json() or {}
    status = data.get('status')
    if status and status not in VALID_STATUSES:
        return jsonify({'message': f'Statut invalide. Valeurs possibles : {", ".join(VALID_STATUSES)}'}), 400
    if status:
        order.status = status

    try:
        db.session.commit()
        return jsonify({'message': 'Commande mise à jour !', 'order': order.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500


@orders_bp.route('/api/admin/orders/<int:id>', methods=['DELETE'])
@admin_required
def admin_delete_order(id):
    order = Order.query.get(id)
    if not order:
        return jsonify({'message': 'Commande non trouvée'}), 404

    try:
        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': 'Commande supprimée !'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500
