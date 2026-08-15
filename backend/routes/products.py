import re
import json
from flask import Blueprint, jsonify, request
from database import db
from models.product import Product
from utils.auth import admin_required

products_bp = Blueprint('products', __name__)


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')


def normalize_images(value):
    """Accepte soit une liste JS (JSON), soit une chaîne déjà JSON, et renvoie du JSON stringifié ou None."""
    if value is None:
        return None
    if isinstance(value, list):
        return json.dumps([v for v in value if v])
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return json.dumps(parsed)
        except (ValueError, TypeError):
            pass
    return None


# ==========================================
# 1. READ ALL (public - catalogue)
# ==========================================
@products_bp.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products]), 200


# ==========================================
# 2. READ ONE
# ==========================================
@products_bp.route('/api/products/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'message': 'Produit non trouvé'}), 404

    return jsonify(product.to_dict()), 200


# ==========================================
# 3. CREATE (admin, back office)
# ==========================================
@products_bp.route('/api/products', methods=['POST'])
@admin_required
def create_product():
    data = request.get_json() or {}

    required_fields = ['name', 'price_monthly', 'category_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Le champ "{field}" est obligatoire.'}), 400

    if Product.query.filter_by(name=data['name']).first():
        return jsonify({'message': 'Un produit avec ce nom existe déjà.'}), 409

    slug = data.get('slug') or slugify(data['name'])
    if Product.query.filter_by(slug=slug).first():
        return jsonify({'message': 'Un produit avec ce slug existe déjà.'}), 409

    new_product = Product(
        name=data['name'],
        description=data.get('description'),
        images=normalize_images(data.get('images')),
        slug=slug,
        price_monthly=data['price_monthly'],
        price_annual=data.get('price_annual'),
        available=data.get('available', True),
        category_id=data['category_id']
    )

    try:
        db.session.add(new_product)
        db.session.commit()
        return jsonify({
            'message': 'Produit créé avec succès !',
            'product': new_product.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500


# ==========================================
# 4. UPDATE (admin, back office)
# ==========================================
@products_bp.route('/api/products/<int:id>', methods=['PUT'])
@admin_required
def update_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'message': 'Produit non trouvé'}), 404

    data = request.get_json() or {}

    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'images' in data:
        product.images = normalize_images(data['images'])
    if 'slug' in data:
        product.slug = data['slug']
    if 'price_monthly' in data:
        product.price_monthly = data['price_monthly']
    if 'price_annual' in data:
        product.price_annual = data['price_annual']
    if 'available' in data:
        product.available = data['available']
    if 'category_id' in data:
        product.category_id = data['category_id']

    try:
        db.session.commit()
        return jsonify({
            'message': 'Produit mis à jour avec succès !',
            'product': product.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur lors de la mise à jour', 'error': str(e)}), 500


# ==========================================
# 5. DELETE (admin, back office)
# ==========================================
@products_bp.route('/api/products/<int:id>', methods=['DELETE'])
@admin_required
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({'message': 'Produit non trouvé'}), 404

    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': f'Produit {id} supprimé avec succès !'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur lors de la suppression', 'error': str(e)}), 500