from database import db


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    images = db.Column(db.Text, nullable=True)
    slug = db.Column(db.String(100), nullable=False, unique=True)
    price_monthly = db.Column(db.Integer, nullable=False)
    price_annual = db.Column(db.Integer, nullable=True)
    available = db.Column(db.Boolean, nullable=False, default=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'images': self.images,
            'slug': self.slug,
            'price_monthly': self.price_monthly,
            'price_annual': self.price_annual,
            'available': bool(self.available),
            'category_id': self.category_id
        }