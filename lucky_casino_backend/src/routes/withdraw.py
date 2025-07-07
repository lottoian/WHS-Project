from flask import Blueprint, request, jsonify
from ..database import db_session
from ..models.withdraw import Withdraw
from ..models.user import User

bp = Blueprint('withdraw', __name__, url_prefix='/api/withdraw')

@bp.route('/request', methods=['POST'])
def withdraw_request():
    data = request.get_json()
    username = data.get('username')
    amount = data.get('amount')
    account_number = data.get('account_number')
    if not username or not amount or not account_number:
        return jsonify({'status': 'error', 'message': '필수 정보 누락'}), 400
    user = db_session.query(User).filter_by(username=username).first()
    if not user:
        return jsonify({'status': 'error', 'message': '사용자 없음'}), 400
    if user.game_money < amount:
        return jsonify({'status': 'error', 'message': '환전할 금액이 부족합니다.'}), 400
    withdraw = Withdraw(username=username, amount=amount, account_number=account_number)
    db_session.add(withdraw)
    db_session.commit()
    return jsonify({'status': 'ok'})

@bp.route('/list', methods=['GET'])
def withdraw_list():
    withdraws = db_session.query(Withdraw).order_by(Withdraw.created_at.desc()).all()
    return jsonify([
        {
            'id': w.id,
            'username': w.username,
            'amount': w.amount,
            'status': w.status
        } for w in withdraws
    ])

@bp.route('/user-list', methods=['POST'])
def withdraw_user_list():
    data = request.get_json()
    username = data.get('username')
    if not username:
        return jsonify({'status': 'error', 'message': '필수 정보 누락'}), 400
    withdraws = db_session.query(Withdraw).filter_by(username=username).order_by(Withdraw.created_at.desc()).all()
    return jsonify([
        {
            'id': w.id,
            'amount': w.amount,
            'status': w.status,
            'created_at': w.created_at.strftime('%Y-%m-%d %H:%M')
        } for w in withdraws
    ])

@bp.route('/approve', methods=['POST'])
def withdraw_approve():
    data = request.get_json()
    withdraw_id = data.get('id')
    withdraw = db_session.query(Withdraw).filter_by(id=withdraw_id).first()
    if not withdraw or withdraw.status == '승인 완료':
        return jsonify({'status': 'error', 'message': '잘못된 요청'}), 400
    user = db_session.query(User).filter_by(username=withdraw.username).first()
    if not user:
        return jsonify({'status': 'error', 'message': '사용자 없음'}), 400
    if user.game_money < withdraw.amount:
        return jsonify({'status': 'error', 'message': '잔액 부족'}), 400
    user.game_money -= withdraw.amount
    withdraw.status = '승인 완료'
    db_session.commit()
    return jsonify({'status': 'ok'}) 