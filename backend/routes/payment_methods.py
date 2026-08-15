import stripe
from flask import Blueprint, jsonify, session
from database import db
from models.payment_method import PaymentMethod
from models.user import User
from utils.auth import login_required, admin_required

payment_methods_bp = Blueprint('payment_methods', __name__)

# Volontairement PAS de route POST/PUT manuelle ici : un moyen de paiement ne doit
# jamais être créé ou modifié "à la main" côté serveur (conformité PCI-DSS).
# Il est créé automatiquement par le webhook Stripe (voir routes/payments.py)
# lorsqu'un SetupIntent réussit.


@payment_methods_bp.route('/api/payment-methods', methods=['GET'])
@login_required
def get_payment_methods():
    methods = PaymentMethod.query.filter_by(user_id=session['user_id']).all()
    return jsonify([m.to_dict() for m in methods]), 200


@payment_methods_bp.route('/api/payment-methods/<int:id>', methods=['DELETE'])
@login_required
def delete_payment_method(id):
    method = PaymentMethod.query.get(id)
    if not method or method.user_id != session['user_id']:
        return jsonify({'message': 'Moyen de paiement non trouvé'}), 404

    try:
        if method.stripe_payment_method_id:
            stripe.PaymentMethod.detach(method.stripe_payment_method_id)
        db.session.delete(method)
        db.session.commit()
        return jsonify({'message': 'Moyen de paiement supprimé !'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500


@payment_methods_bp.route('/api/payment-methods/<int:id>/default', methods=['PUT'])
@login_required
def set_default_payment_method(id):
    method = PaymentMethod.query.get(id)
    if not method or method.user_id != session['user_id']:
        return jsonify({'message': 'Moyen de paiement non trouvé'}), 404

    try:
        PaymentMethod.query.filter_by(user_id=session['user_id']).update({'is_default': False})
        method.is_default = True
        db.session.commit()
        return jsonify({'message': 'Moyen de paiement par défaut mis à jour !'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500


# --- ADMIN : lecture seule (jamais de création/modif manuelle d'une carte) ---
@payment_methods_bp.route('/api/admin/payment-methods', methods=['GET'])
@admin_required
def admin_get_payment_methods():
    methods = PaymentMethod.query.all()
    return jsonify([m.to_dict() for m in methods]), 200
