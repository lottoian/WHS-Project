from ..models import db
from sqlalchemy import func

class Charge(db.Model):
    __tablename__ = 'charge'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(64), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=func.now())
    status = db.Column(db.String(16), default='pending') 