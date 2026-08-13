from datetime import datetime, time, timedelta
from flask import Blueprint, jsonify
from sqlalchemy import func
from database import db
from models.order import Order
from models.order_item import OrderItem
from models.product import Product
from models.user import User
from models.category import Categorie
from utils.auth import admin_required

dashboard_bp = Blueprint('dashboard', __name__)

# On considère qu'une commande ne "compte" comme chiffre d'affaires réel que
# lorsqu'elle est payée. Les autres statuts (pending/failed/cancelled) sont
# comptés à part pour donner une vue d'ensemble, mais n'entrent pas dans le CA.
PAID = ['paid']
VALID_STATUSES = ['pending', 'paid', 'failed', 'cancelled']


@dashboard_bp.route('/api/admin/dashboard/stats', methods=['GET'])
@admin_required
def get_dashboard_stats():
    now = datetime.utcnow()
    today_start = datetime.combine(now.date(), time.min)
    week_start = today_start - timedelta(days=today_start.weekday())  # lundi de cette semaine
    month_start = today_start.replace(day=1)

    def order_agg(start=None, statuses=None):
        q = db.session.query(func.count(Order.id), func.coalesce(func.sum(Order.total_amount), 0))
        if start:
            q = q.filter(Order.created_at >= start)
        if statuses:
            q = q.filter(Order.status.in_(statuses))
        count, revenue = q.one()
        return {'count': int(count), 'revenue': int(revenue)}

    # --- Commandes : compteurs + CA sur différentes périodes ---
    orders_today = order_agg(start=today_start, statuses=PAID)
    orders_week = order_agg(start=week_start, statuses=PAID)
    orders_month = order_agg(start=month_start, statuses=PAID)
    orders_all_paid = order_agg(statuses=PAID)
    orders_all = order_agg()

    status_counts = dict(db.session.query(Order.status, func.count(Order.id)).group_by(Order.status).all())
    for s in VALID_STATUSES:
        status_counts.setdefault(s, 0)

    billing_period_counts = dict(
        db.session.query(OrderItem.billing_period, func.count(OrderItem.id)).group_by(OrderItem.billing_period).all()
    )
    for p in ['monthly', 'annual']:
        billing_period_counts.setdefault(p, 0)

    avg_order_value = round(orders_all_paid['revenue'] / status_counts['paid']) if status_counts['paid'] else 0

    # --- Produits populaires (par quantité vendue, commandes payées uniquement) ---
    top_products_rows = (
        db.session.query(
            Product.id, Product.name,
            func.coalesce(func.sum(OrderItem.quantity), 0).label('qty'),
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.unit_price), 0).label('rev')
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.status == 'paid')
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    top_products = [
        {'product_id': r[0], 'name': r[1], 'quantity_sold': int(r[2]), 'revenue': int(r[3])}
        for r in top_products_rows
    ]

    # --- Meilleurs clients (par montant dépensé) ---
    top_customers_rows = (
        db.session.query(
            User.id, User.username, User.email,
            func.count(Order.id).label('orders_count'),
            func.coalesce(func.sum(Order.total_amount), 0).label('total_spent')
        )
        .join(Order, Order.user_id == User.id)
        .filter(Order.status == 'paid')
        .group_by(User.id, User.username, User.email)
        .order_by(func.sum(Order.total_amount).desc())
        .limit(5)
        .all()
    )
    top_customers = [
        {'user_id': r[0], 'username': r[1], 'email': r[2], 'orders_count': int(r[3]), 'total_spent': int(r[4])}
        for r in top_customers_rows
    ]

    # --- CA par catégorie ---
    revenue_by_category_rows = (
        db.session.query(
            Categorie.name,
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.unit_price), 0).label('rev')
        )
        .join(Product, Product.category_id == Categorie.id)
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.status == 'paid')
        .group_by(Categorie.name)
        .order_by(func.sum(OrderItem.quantity * OrderItem.unit_price).desc())
        .all()
    )
    revenue_by_category = [{'category': r[0], 'revenue': int(r[1])} for r in revenue_by_category_rows]

    # --- Utilisateurs ---
    users_total = User.query.count()
    users_verified = User.query.filter_by(is_verified=1).count()
    users_admins = User.query.filter_by(role='admin').count()
    users_new_week = User.query.filter(User.created_at >= week_start).count()
    users_new_month = User.query.filter(User.created_at >= month_start).count()

    # --- Produits ---
    products_total = Product.query.count()
    products_available = Product.query.filter_by(available=True).count()

    # --- Dernières commandes ---
    recent_orders_rows = Order.query.order_by(Order.created_at.desc()).limit(6).all()
    user_ids = [o.user_id for o in recent_orders_rows]
    username_map = {u.id: u.username for u in User.query.filter(User.id.in_(user_ids)).all()} if user_ids else {}
    recent_orders = []
    for o in recent_orders_rows:
        d = o.to_dict(include_items=False)
        d['username'] = username_map.get(o.user_id)
        recent_orders.append(d)

    return jsonify({
        'orders': {
            'today': orders_today,
            'week': orders_week,
            'month': orders_month,
            'all_time_paid': orders_all_paid,
            'all_time_all_statuses': orders_all,
            'by_status': status_counts,
            'billing_period_split': billing_period_counts,
            'average_order_value': avg_order_value
        },
        'top_products': top_products,
        'top_customers': top_customers,
        'revenue_by_category': revenue_by_category,
        'users': {
            'total': users_total,
            'verified': users_verified,
            'unverified': users_total - users_verified,
            'admins': users_admins,
            'new_this_week': users_new_week,
            'new_this_month': users_new_month
        },
        'products': {
            'total': products_total,
            'available': products_available,
            'unavailable': products_total - products_available
        },
        'recent_orders': recent_orders
    }), 200
