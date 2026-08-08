from flask import Blueprint, jsonify, request
from database import db
from models.category import Categorie
from utils.auth import admin_required

categories_bp = Blueprint('categories', __name__)


# ==========================================
# 1. READ ALL (public - utilisé par le catalogue)
# ==========================================
@categories_bp.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Categorie.query.all()
    return jsonify([c.to_dict() for c in categories])


# ==========================================
# 2. READ ONE
# ==========================================
@categories_bp.route('/api/categories/<int:id>', methods=['GET'])
def get_category(id):
    category = Categorie.query.get(id)
    if not category:
        return jsonify({'message': 'Catégorie non trouvée'}), 404
    return jsonify(category.to_dict()), 200


# ==========================================
# 3. CREATE (admin, back office)
# ==========================================
@categories_bp.route('/api/categories', methods=['POST'])
@admin_required
def create_category():
    data = request.get_json() or {}

    for field in ['slug', 'name', 'icon']:
        if not data.get(field):
            return jsonify({'message': f'Le champ "{field}" est obligatoire.'}), 400

    if Categorie.query.filter_by(slug=data['slug']).first():
        return jsonify({'message': 'Une catégorie avec ce slug existe déjà.'}), 409
    if Categorie.query.filter_by(name=data['name']).first():
        return jsonify({'message': 'Une catégorie avec ce nom existe déjà.'}), 409

    category = Categorie(slug=data['slug'], name=data['name'], icon=data['icon'])

    try:
        db.session.add(category)
        db.session.commit()
        return jsonify({'message': 'Catégorie créée !', 'category': category.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500


# ==========================================
# 4. UPDATE (admin, back office)
# ==========================================
@categories_bp.route('/api/categories/<int:id>', methods=['PUT'])
@admin_required
def update_category(id):
    category = Categorie.query.get(id)
    if not category:
        return jsonify({'message': 'Catégorie non trouvée'}), 404

    data = request.get_json() or {}
    for field in ['slug', 'name', 'icon']:
        if field in data:
            setattr(category, field, data[field])

    try:
        db.session.commit()
        return jsonify({'message': 'Catégorie mise à jour !', 'category': category.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur lors de la mise à jour', 'error': str(e)}), 500


# ==========================================
# 5. DELETE (admin, back office)
# ==========================================
@categories_bp.route('/api/categories/<int:id>', methods=['DELETE'])
@admin_required
def delete_category(id):
    category = Categorie.query.get(id)
    if not category:
        return jsonify({'message': 'Catégorie non trouvée'}), 404

    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({'message': f'Catégorie {id} supprimée avec succès !'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur lors de la suppression (probablement liée à des produits existants)', 'error': str(e)}), 500
