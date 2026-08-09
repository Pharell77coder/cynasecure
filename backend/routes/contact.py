import os
from flask import Blueprint, jsonify, request
from flask_mail import Message
from database import mail

contact_bp = Blueprint('contact', __name__)

ADMIN_EMAIL = os.environ.get('CONTACT_RECIPIENT_EMAIL', 'support@cyna.fr')

SUBJECT_LABELS = {
    'support': 'Support technique',
    'billing': 'Facturation / Paiement',
    'subscriptions': 'Abonnements',
    'sales': 'Question commerciale',
    'other': 'Autre'
}


@contact_bp.route('/api/contact', methods=['POST'])
def send_contact_message():
    data = request.get_json() or {}
    email = data.get('email')
    subject = data.get('subject')
    message_text = data.get('message')

    if not email or not subject or not message_text:
        return jsonify({'message': 'Tous les champs sont requis.'}), 400
    if len(message_text) < 10:
        return jsonify({'message': 'Le message doit faire au moins 10 caractères.'}), 400

    subject_label = SUBJECT_LABELS.get(subject, subject)

    try:
        msg = Message(
            f"[Contact Cyna] {subject_label}",
            recipients=[ADMIN_EMAIL],
            reply_to=email
        )
        msg.body = f"De : {email}\nSujet : {subject_label}\n\n{message_text}"
        mail.send(msg)
        return jsonify({'message': 'Message envoyé ! Nous vous répondrons sous 24h.'}), 200
    except Exception as e:
        return jsonify({'message': "Erreur lors de l'envoi du message.", 'error': str(e)}), 500
