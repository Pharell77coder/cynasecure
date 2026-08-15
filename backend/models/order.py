from database import db
from models.order_item import OrderItem


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String(50), nullable=False, default='pending')  # pending, paid, failed, cancelled
    total_amount = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    billing_address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'), nullable=True)
    stripe_payment_intent_id = db.Column(db.String(255), nullable=True)

    items = db.relationship('OrderItem', backref='order', cascade='all, delete-orphan')

    def to_dict(self, include_items=True):
        data = {
            'id': self.id,
            'status': self.status,
            'total_amount': self.total_amount,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user_id': self.user_id,
            'billing_address_id': self.billing_address_id
        }
        if include_items:
            data['items'] = [i.to_dict() for i in self.items]
        return data
