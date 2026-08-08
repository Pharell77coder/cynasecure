from database import db


class PaymentMethod(db.Model):
    __tablename__ = 'payment_methods'

    id = db.Column(db.Integer, primary_key=True)
    brand = db.Column(db.String(30))
    last4 = db.Column(db.String(4))
    is_default = db.Column(db.Boolean, nullable=False, default=False)
    stripe_payment_method_id = db.Column(db.String(255), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'brand': self.brand,
            'last4': self.last4,
            'is_default': bool(self.is_default),
            'user_id': self.user_id
        }
