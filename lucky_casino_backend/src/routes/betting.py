from flask import Blueprint, request, jsonify, session
from models import db, Game, Bet, User, Transaction
from src.routes import login_required
import random

betting_bp = Blueprint("betting", __name__)

@betting_bp.route("/games", methods=["GET"])
def get_games():
    games = Game.query.all()
    return jsonify([game.to_dict() for game in games])

@betting_bp.route("/bet/<int:game_id>", methods=["POST"])
@login_required
def place_bet(game_id):
    data = request.get_json()
    bet_amount = data.get("amount")
    user_id = session["user_id"]

    user = User.query.get(user_id)
    game = Game.query.get(game_id)

    if not user or not game:
        return jsonify({"message": "사용자 또는 게임을 찾을 수 없습니다."}), 404

    if not isinstance(bet_amount, int) or bet_amount <= 0:
        return jsonify({"message": "유효한 베팅 금액을 입력해주세요."}), 400

    if bet_amount < game.min_bet or bet_amount > game.max_bet:
        return jsonify({"message": f"베팅 금액은 {game.min_bet}원 이상 {game.max_bet}원 이하여야 합니다."}), 400

    if user.game_money < bet_amount:
        return jsonify({"message": "보유 게임 머니가 부족합니다."}), 400

    # 베팅 로직 (50% 확률로 승리, 2배 지급)
    win = random.random() < 0.5
    profit_loss = bet_amount if win else -bet_amount

    user.game_money += profit_loss

    new_bet = Bet(
        user_id=user.id,
        game_id=game.id,
        bet_amount=bet_amount,
        win=win,
        profit_loss=profit_loss
    )
    db.session.add(new_bet)

    # 거래 내역 기록
    transaction_type = "bet_win" if win else "bet_loss"
    new_transaction = Transaction(
        user_id=user.id,
        type=transaction_type,
        amount=abs(profit_loss),
        current_balance=user.game_money
    )
    db.session.add(new_transaction)

    db.session.commit()

    return jsonify({
        "message": "베팅 완료!".format(game.name),
        "win": win,
        "amount": abs(profit_loss),
        "current_money": user.game_money
    })


