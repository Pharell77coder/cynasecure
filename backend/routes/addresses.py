from flask import Blueprint, jsonify, request, session
from database import db
from models.address import Address
from utils.auth import login_required, admin_required

addresses_bp = Blueprint('addresses', __name__)

REQUIRED_FIELDS = ['first_name', 'last_name', 'address1', 'city', 'postal_code', 'country']


# --- LISTE DES ADRESSES DE L'UTILISATEUR CONNECTÉ ---
@addresses_bp.route('/api/addresses', methods=['GET'])
@login_required
def get_addresses():
    addresses = Address.query.filter_by(user_id=session['user_id']).all()
    return jsonify([a.to_dict() for a in addresses]), 200


@addresses_bp.route('/api/addresses/<int:id>', methods=['GET'])
@login_required
def get_address(id):
    address = Address.query.get(id)
    if not address or address.user_id != session['user_id']:
        return jsonify({'message': 'Adresse non trouvée'}), 404
    return jsonify(address.to_dict()), 200


@addresses_bp.route('/api/addresses', methods=['POST'])
@login_required
def create_address():
    data = request.get_json() or {}
    for field in REQUIRED_FIELDS:
        if not data.get(field):
            return jsonify({'message': f'Le champ "{field}" est obligatoire.'}), 400

    address = Address(
        first_name=data['first_name'],
        last_name=data['last_name'],
        address1=data['address1'],
        city=data['city'],
        postal_code=data['postal_code'],
        country=data['country'],
        user_id=session['user_id']
    )
    try:
        db.session.add(address)
        db.session.commit()
        return jsonify({'message': 'Adresse ajoutée !', 'address': address.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500


@addresses_bp.route('/api/addresses/<int:id>', methods=['PUT'])
@login_required
def update_address(id):
    address = Address.query.get(id)
    if not address or address.user_id != session['user_id']:
        return jsonify({'message': 'Adresse non trouvée'}), 404

    data = request.get_json() or {}
    for field in REQUIRED_FIELDS:
        if field in data:
            setattr(address, field, data[field])

    try:
        db.session.commit()
        return jsonify({'message': 'Adresse mise à jour !', 'address': address.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500


@addresses_bp.route('/api/addresses/<int:id>', methods=['DELETE'])
@login_required
def delete_address(id):
    address = Address.query.get(id)
    if not address or address.user_id != session['user_id']:
        return jsonify({'message': 'Adresse non trouvée'}), 404

    try:
        db.session.delete(address)
        db.session.commit()
        return jsonify({'message': 'Adresse supprimée !'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500


# --- ADMIN : VOIR TOUTES LES ADRESSES (back office) ---
@addresses_bp.route('/api/admin/addresses', methods=['GET'])
@admin_required
def admin_get_addresses():
    addresses = Address.query.all()
    return jsonify([a.to_dict() for a in addresses]), 200
