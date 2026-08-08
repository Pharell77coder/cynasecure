from flask import Blueprint, jsonify, request, session
from database import db
from models.order import Order
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


# --- ADMIN : LISTE / MISE À JOUR DE STATUT / SUPPRESSION (back office) ---
@orders_bp.route('/api/admin/orders', methods=['GET'])
@admin_required
def admin_get_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200


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
