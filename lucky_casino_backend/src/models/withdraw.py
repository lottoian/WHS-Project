from sqlalchemy import Column, Integer, String, DateTime, Boolean, func
from ..database import Base

class Withdraw(Base):
    __tablename__ = 'withdraw'
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(64), nullable=False)
    amount = Column(Integer, nullable=False)
    account_number = Column(String(64), nullable=False)
    created_at = Column(DateTime, default=func.now())
    status = Column(String(16), default='pending') 