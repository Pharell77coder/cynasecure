from database import db


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    slug = db.Column(db.String(100), nullable=False, unique=True)
    price_monthly = db.Column(db.Integer, nullable=False)
    available = db.Column(db.Boolean, nullable=False, default=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'slug': self.slug,
            'price_monthly': self.price_monthly,
            'available': bool(self.available),
            'category_id': self.category_id
        }
