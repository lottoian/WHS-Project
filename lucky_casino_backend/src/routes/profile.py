from flask import Blueprint, jsonify, session
from models import Bet, Transaction
from src.routes import login_required

profile_bp = Blueprint("profile", __name__)

@profile_bp.route("/betting-history", methods=["GET"])
@login_required
def get_betting_history():
    user_id = session["user_id"]
    bets = Bet.query.filter_by(user_id=user_id).order_by(Bet.bet_time.desc()).all()
    return jsonify([bet.to_dict() for bet in bets])

@profile_bp.route("/transaction-history", methods=["GET"])
@login_required
def get_transaction_history():
    user_id = session["user_id"]
    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.transaction_time.desc()).all()
    return jsonify([t.to_dict() for t in transactions])


