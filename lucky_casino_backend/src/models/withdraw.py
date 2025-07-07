from ..models import db
from sqlalchemy import func

class Withdraw(db.Model):
    __tablename__ = 'withdraw'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(64), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    account_number = db.Column(db.String(64), nullable=False)
    created_at = db.Column(db.DateTime, default=func.now())
    status = db.Column(db.String(16), default='pending') 