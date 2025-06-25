from datetime import datetime
from . import db

class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    min_bet = db.Column(db.Integer, nullable=False)
    max_bet = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "min_bet": self.min_bet,
            "max_bet": self.max_bet
        }

class Bet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)
    bet_amount = db.Column(db.Integer, nullable=False)
    win = db.Column(db.Boolean, nullable=False)
    profit_loss = db.Column(db.Integer, nullable=False) # 획득 또는 손실 금액 (음수 가능)
    bet_time = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('bets', lazy=True))
    game = db.relationship('Game', backref=db.backref('bets', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "game_id": self.game_id,
            "game_name": self.game.name, # 게임 이름 추가
            "bet_amount": self.bet_amount,
            "win": self.win,
            "profit_loss": self.profit_loss,
            "bet_time": self.bet_time.isoformat()
        }

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False) # \"deposit\" or \"withdrawal\" or \"bet_win\" or \"bet_loss\"
    amount = db.Column(db.Integer, nullable=False)
    current_balance = db.Column(db.Integer, nullable=False) # 거래 후 잔액
    transaction_time = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('transactions', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "type": self.type,
            "amount": self.amount,
            "current_balance": self.current_balance,
            "transaction_time": self.transaction_time.isoformat()
        }


