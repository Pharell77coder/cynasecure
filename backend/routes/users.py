import secrets
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request, session
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash
from database import db, mail
from models.user import User
from utils.auth import login_required, admin_required

users_bp = Blueprint('users', __name__)


# --- 1. INSCRIPTION AVEC ENVOI DE MAIL ---
@users_bp.route('/api/users/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email')
    name_from_react = data.get('name')
    password = data.get('password')

    if not email or not name_from_react or not password:
        return jsonify({'message': 'Tous les champs sont requis'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Cet email est déjà pris'}), 409

    token = secrets.token_hex(32)
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    new_user = User(
        username=name_from_react,
        email=email,
        password=hashed_password,
        role='user',
        confirmation_token=token,
        is_verified=0
    )

    try:
        db.session.add(new_user)
        db.session.commit()

        verify_url = f"http://localhost:5173/verify-email?token={token}"
        msg = Message("Confirmez votre compte !", recipients=[email])
        msg.body = (
            f"Bonjour {name_from_react},\n\n"
            f"Merci pour votre inscription. Veuillez cliquer sur ce lien pour valider votre compte : {verify_url}"
        )
        msg.html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
                <h2>Bienvenue {name_from_react} !</h2>
                <p>Merci pour votre inscription sur Cyna. Cliquez sur le bouton ci-dessous pour valider votre compte :</p>
                <p style="text-align: center; margin: 24px 0;">
                    <a href="{verify_url}"
                       style="background-color:#2563eb; color:#ffffff; padding:12px 24px;
                              border-radius:8px; text-decoration:none; display:inline-block;">
                        Confirmer mon compte
                    </a>
                </p>
                <p style="font-size: 12px; color: #666;">
                    Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                    <a href="{verify_url}">{verify_url}</a>
                </p>
            </div>
        """
        mail.send(msg)

        return jsonify({'message': 'Compte créé ! Veuillez vérifier vos emails (Maildev).'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500


# --- 2. VÉRIFICATION DU COMPTE ---
@users_bp.route('/api/users/verify/<token>', methods=['GET'])
def verify_account(token):
    user = User.query.filter_by(confirmation_token=token).first()

    if not user:
        return jsonify({'message': 'Token invalide ou expiré.'}), 400

    user.is_verified = 1
    user.confirmation_token = None
    db.session.commit()

    return jsonify({'message': 'Votre compte a été validé avec succès !'}), 200


# --- 3. CONNEXION (crée une session serveur) ---
@users_bp.route('/api/users/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email et mot de passe requis.'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Identifiants incorrects.'}), 401

    if not user.is_verified:
        return jsonify({'message': 'Veuillez confirmer votre compte par email avant de vous connecter.'}), 403

    session.clear()
    session['user_id'] = user.id
    session.permanent = True

    return jsonify({
        'message': f'Bienvenue {user.username} !',
        'user': user.to_dict()
    }), 200


# --- 3bis. DÉCONNEXION ---
@users_bp.route('/api/users/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Déconnecté.'}), 200


# --- 3ter. UTILISATEUR COURANT (pour restaurer la session au chargement du front) ---
@users_bp.route('/api/users/me', methods=['GET'])
@login_required
def me():
    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        return jsonify({'message': 'Session invalide.'}), 401
    return jsonify({'user': user.to_dict()}), 200


# --- 3quater. MODIFIER SES INFORMATIONS (nom / email) ---
@users_bp.route('/api/users/me', methods=['PUT'])
@login_required
def update_me():
    user = User.query.get(session['user_id'])
    data = request.get_json() or {}

    new_username = data.get('username')
    new_email = data.get('email')

    if new_username and new_username != user.username:
        if User.query.filter_by(username=new_username).first():
            return jsonify({'message': 'Ce nom d\'utilisateur est déjà pris.'}), 409
        user.username = new_username

    if new_email and new_email != user.email:
        if User.query.filter_by(email=new_email).first():
            return jsonify({'message': 'Cet email est déjà utilisé.'}), 409
        user.email = new_email
        # Changer d'email doit repasser par une vérification, comme à l'inscription.
        user.is_verified = 0
        user.confirmation_token = secrets.token_hex(32)
        verify_url = f"http://localhost:5173/confirmation-email/{user.confirmation_token}"
        msg = Message("Confirmez votre nouvelle adresse email", recipients=[new_email])
        msg.body = f"Cliquez sur ce lien pour valider votre nouvel email : {verify_url}"
        mail.send(msg)

    try:
        db.session.commit()
        return jsonify({'message': 'Profil mis à jour !', 'user': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur serveur', 'error': str(e)}), 500


# --- 3quinquies. CHANGER SON MOT DE PASSE (depuis le compte, en étant connecté) ---
@users_bp.route('/api/users/me/password', methods=['PUT'])
@login_required
def change_password():
    user = User.query.get(session['user_id'])
    data = request.get_json() or {}
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not current_password or not new_password:
        return jsonify({'message': 'Mot de passe actuel et nouveau mot de passe requis.'}), 400

    if not check_password_hash(user.password, current_password):
        return jsonify({'message': 'Mot de passe actuel incorrect.'}), 401

    if len(new_password) < 8:
        return jsonify({'message': 'Le nouveau mot de passe doit contenir au moins 8 caractères.'}), 400

    user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
    db.session.commit()
    return jsonify({'message': 'Mot de passe modifié !'}), 200


# --- 4. MOT DE PASSE OUBLIÉ ---
@users_bp.route('/api/users/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email')

    user = User.query.filter_by(email=email).first()
    if not user:
        # On ne révèle jamais si l'email existe ou non
        return jsonify({'message': 'Si cet email existe, un lien de réinitialisation a été envoyé.'}), 200

    reset_token = secrets.token_hex(32)
    user.reset_password_token = reset_token
    user.reset_password_token_expires_at = datetime.utcnow() + timedelta(hours=1)
    db.session.commit()

    reset_url = f"http://localhost:5173/reset-password?token={reset_token}"
    msg = Message("Réinitialisation de votre mot de passe", recipients=[email])
    msg.body = (
        f"Bonjour {user.username},\n\n"
        f"Pour réinitialiser votre mot de passe, cliquez ici : {reset_url}\n"
        f"Ce lien expire dans 1 heure."
    )
    mail.send(msg)

    return jsonify({'message': 'Email de réinitialisation envoyé.'}), 200


# --- 5. APPLIQUER LE NOUVEAU MOT DE PASSE ---
@users_bp.route('/api/users/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token')
    new_password = data.get('password')

    if not token or not new_password:
        return jsonify({'message': 'Données manquantes.'}), 400

    user = User.query.filter_by(reset_password_token=token).first()

    if not user or not user.reset_password_token_expires_at or user.reset_password_token_expires_at < datetime.utcnow():
        return jsonify({'message': 'Le jeton est invalide ou a expiré.'}), 400

    user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
    user.reset_password_token = None
    user.reset_password_token_expires_at = None
    db.session.commit()

    return jsonify({'message': 'Votre mot de passe a bien été modifié !'}), 200


# --- 6. RÉCUPÉRER TOUS LES UTILISATEURS (admin, back office) ---
@users_bp.route('/api/users', methods=['GET'])
@admin_required
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200


# --- 7. ADMIN : CHANGER LE RÔLE D'UN UTILISATEUR ---
@users_bp.route('/api/admin/users/<int:id>/role', methods=['PUT'])
@admin_required
def update_user_role(id):
    user = User.query.get(id)
    if not user:
        return jsonify({'message': 'Utilisateur non trouvé'}), 404

    data = request.get_json() or {}
    role = data.get('role')
    if role not in ('user', 'admin'):
        return jsonify({'message': 'Rôle invalide (user ou admin).'}), 400

    user.role = role
    db.session.commit()
    return jsonify({'message': 'Rôle mis à jour !', 'user': user.to_dict()}), 200


# --- 8. ADMIN : SUPPRIMER UN UTILISATEUR ---
@users_bp.route('/api/admin/users/<int:id>', methods=['DELETE'])
@admin_required
def delete_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({'message': 'Utilisateur non trouvé'}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'Utilisateur supprimé !'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Erreur lors de la suppression', 'error': str(e)}), 500
