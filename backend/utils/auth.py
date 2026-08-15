from functools import wraps
from flask import session, jsonify
from models.user import User


def login_required(f):
    """Protège une route : nécessite une session utilisateur active."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Authentification requise.'}), 401
        return f(*args, **kwargs)
    return wrapper


def admin_required(f):
    """Protège une route : nécessite une session + rôle admin."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Authentification requise.'}), 401
        user = User.query.get(session['user_id'])
        if not user or user.role != 'admin':
            return jsonify({'message': 'Accès réservé aux administrateurs.'}), 403
        return f(*args, **kwargs)
    return wrapper


def current_user():
    if 'user_id' not in session:
        return None
    return User.query.get(session['user_id'])
